//
//  DeviceInfo.m
//  LittleBee
//
//  Created by gaoshilei on 2017/8/16.
//  Copyright © 2017年 weyao. All rights reserved.
//

#import "DeviceInfo.h"
#import <UIKit/UIKit.h>
#import <SystemConfiguration/CaptiveNetwork.h>
#import <sys/stat.h>
#import <sys/sysctl.h>
#import <sys/utsname.h>
#import <CoreTelephony/CTCarrier.h>
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import <AdSupport/AdSupport.h>
#import <ifaddrs.h>
#import <arpa/inet.h>

#define NOTJAIL 4783242
#define SYSTEM_VERSION_LESS_THAN(v)                 ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)

#define USERDEFAULT_OBJECT(key) [[NSUserDefaults standardUserDefaults] objectForKey:key]
#define USERDEFAULT_SET_OBJECT(object,_key_) [[NSUserDefaults standardUserDefaults] setObject:object forKey:_key_];\
[[NSUserDefaults standardUserDefaults] synchronize]

#define SCREEN_WIDTH [UIScreen mainScreen].bounds.size.width
#define SCREEN_HEIGHT [UIScreen mainScreen].bounds.size.height

#define MB (1024*1024)
#define GB (MB*1024)

#define SYSTEM_VERSION_LESS_THAN(v) ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)
#define FILECHECK [NSFileManager defaultManager] fileExistsAtPath:
#define EXEPATH [[NSBundle mainBundle] executablePath]
#define PLISTPATH [[NSBundle mainBundle] infoDictionary]

#define USERLOCATIONKEY @"_userlocation"
#define LOCATION_IPKEY @"_userip"
#define LOCATION_ADDRESSKEY @"_ipaddress"

//------jailbreak check
enum {
    // Failed the Jailbreak Check
    KFJailbroken = 3429542,
    // Failed the OpenURL Check
    KFOpenURL = 321,
    // Failed the Cydia Check
    KFCydia = 432,
    // Failed the Inaccessible Files Check
    KFIFC = 47293,
    // Failed the plist check
    KFPlist = 9412,
    // Failed the Processes Check with Cydia
    KFProcessesCydia = 10012,
    // Failed the Processes Check with other Cydia
    KFProcessesOtherCydia = 42932,
    // Failed the Processes Check with other other Cydia
    KFProcessesOtherOCydia = 10013,
    // Failed the FSTab Check
    KFFSTab = 9620,
    // Failed the System() Check
    KFSystem = 47475,
    // Failed the Symbolic Link Check
    KFSymbolic = 34859,
    // Failed the File Exists Check
    KFFileExists = 6625,
} JailbrokenChecks;

// Jailbreak Check Definitions
#define CYDIA       @"MobileCydia"
#define OTHERCYDIA  @"Cydia"
#define OOCYDIA     @"afpd"
#define CYDIAPACKAGE    @"cydia://package/com.fake.package"
#define CYDIALOC        @"/Applications/Cydia.app"
#define HIDDENFILES     [NSArray arrayWithObjects:@"/Applications/RockApp.app",@"/Applications/Icy.app",@"/usr/sbin/sshd",@"/usr/bin/sshd",@"/usr/libexec/sftp-server",@"/Applications/WinterBoard.app",@"/Applications/SBSettings.app",@"/Applications/MxTube.app",@"/Applications/IntelliScreen.app",@"/Library/MobileSubstrate/DynamicLibraries/Veency.plist",@"/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",@"/private/var/lib/apt",@"/private/var/stash",@"/System/Library/LaunchDaemons/com.ikey.bbot.plist",@"/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",@"/private/var/tmp/cydia.log",@"/private/var/lib/cydia", @"/etc/clutch.conf", @"/var/cache/clutch.plist", @"/etc/clutch_cracked.plist", @"/var/cache/clutch_cracked.plist", @"/var/lib/clutch/overdrive.dylib", @"/var/root/Documents/Cracked/", nil]

@interface DeviceInfo (JailbreakCheck)
+ (int)isJailbrokened;
@end

@implementation DeviceInfo

+ (NSString *)installTime
{
    @try {
        NSString *installT = USERDEFAULT_OBJECT(@"zh_installtime");
        if(installT.length > 0) return installT;
        NSDateFormatter *formatter = [[NSDateFormatter alloc]init];
        [formatter setDateFormat:@"yyyy年MM月dd日HH时mm分"];
        NSTimeInterval timeStamp = [[NSDate date] timeIntervalSince1970];
        installT = [formatter stringFromDate:[NSDate dateWithTimeIntervalSince1970:timeStamp]];
        USERDEFAULT_SET_OBJECT(installT, @"zh_installtime");
        return installT;
    } @catch (NSException *exception) {
        return @"";
    }
}

+ (NSString *)appBundleId
{
    return [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleIdentifier"];
}

+ (NSDictionary *)WIFIInfo
{
    @try {
        NSDictionary *currentWifiInfo = nil;
        // 获取当前的interface 数组
        CFArrayRef currentInterfaces = CNCopySupportedInterfaces();
        
        // 类型转换，将CF对象，转为NS对象，同时将该对象的引用计数交给 ARC 管理
        NSArray *interfaces = (__bridge_transfer NSArray *)currentInterfaces;
        
        if (interfaces.count >0) {
            for (NSString *interfaceName in interfaces) {
                // 转换类型，不改变引用计数
                CFDictionaryRef dictRef = CNCopyCurrentNetworkInfo((__bridge CFStringRef)(interfaceName));
                if (dictRef) {
                    NSDictionary *networkInfo = (__bridge_transfer NSDictionary *)dictRef;
                    NSString *SSID = [networkInfo objectForKey:(__bridge_transfer NSString *)kCNNetworkInfoKeySSID];
                    NSString *BSSID = [networkInfo objectForKey:(__bridge_transfer NSString *)kCNNetworkInfoKeyBSSID];
                    NSData *SSIDDATA = [networkInfo objectForKey:(__bridge_transfer NSData *)kCNNetworkInfoKeySSIDData];
                    
                    currentWifiInfo = @{@"SSID":SSID,
                                        @"BSSID":BSSID,
                                        @"SSIDDATA":SSIDDATA};
                    
                }else{
                    currentWifiInfo = @{@"SSID":@"",
                                        @"BSSID":@"",
                                        @"SSIDDATA":@""};
                    
                }
            }
        }
        return currentWifiInfo;
    } @catch (NSException *exception) {
        return nil;
    }
}

+ (NSString *)SSID
{
    return [[self WIFIInfo] objectForKey:@"SSID"];
}

+ (NSString *)BSSID
{
    return [[self WIFIInfo] objectForKey:@"BSSID"];
}

+ (NSString *)wifiIPAddress
{
    @try {
        NSString *IPAddress;
        struct ifaddrs *Interfaces;
        struct ifaddrs *Temp;
        int Status = 0;
        Status = getifaddrs(&Interfaces);
        if (Status == 0)
        {
            Temp = Interfaces;
            while(Temp != NULL)
            {
                if(Temp->ifa_addr->sa_family == AF_INET)
                {
                    if([[NSString stringWithUTF8String:Temp->ifa_name] isEqualToString:@"en0"])
                    {
                        IPAddress = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)Temp->ifa_addr)->sin_addr)];
                    }
                }
                Temp = Temp->ifa_next;
            }
        }
        freeifaddrs(Interfaces);
        if (IPAddress == nil || IPAddress.length <= 0) {
            return @"";
        }
        return IPAddress;
    }
    @catch (NSException *exception) {
        return @"";
    }
}

+ (NSString *)publicNetIp
{
    return [[self LocationInfo] objectForKey:LOCATION_IPKEY];
}

+ (NSString *)publicNetAddress
{
    return [[self LocationInfo] objectForKey:LOCATION_ADDRESSKEY];
}

+ (NSMutableDictionary *)LocationInfo
{
    __block NSMutableDictionary *location = [NSMutableDictionary dictionary];
    NSURL *url = [NSURL URLWithString:@"http://ip.chinaz.com/getip.aspx"];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url cachePolicy:NSURLRequestReloadIgnoringCacheData timeoutInterval:5.0];
    [request setHTTPMethod:@"GET"];
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        if (data) {
            NSString *responseString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            responseString = [responseString stringByReplacingOccurrencesOfString:@"{" withString:@""];
            responseString = [responseString stringByReplacingOccurrencesOfString:@"}" withString:@""];
            NSArray *data = [responseString componentsSeparatedByString:@","];
            [data enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                NSRange range = [obj rangeOfString:@":"];
                if(range.location == NSNotFound) return;
                NSString *subStr = [obj substringFromIndex:range.location+1];
                subStr = [subStr stringByReplacingOccurrencesOfString:@"'" withString:@""];
                if ([obj rangeOfString:@"ip"].location!=NSNotFound) {
                    [location setObject:subStr forKey:LOCATION_IPKEY];
                }
                if ([obj rangeOfString:@"address"].location!=NSNotFound) {
                    [location setObject:subStr forKey:LOCATION_ADDRESSKEY];
                }
                USERDEFAULT_SET_OBJECT(location, USERLOCATIONKEY);
            }];
        }
    }];
    [dataTask resume];
    return USERDEFAULT_OBJECT(USERLOCATIONKEY);
}

+(NSString *)screenSize
{
    return [NSString stringWithFormat:@"%.0fx%.0f",SCREEN_WIDTH,SCREEN_HEIGHT];
}

+ (NSString *)appVersion
{
    return [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
}

+ (NSString *)appName
{
    return [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleName"];
}

+ (NSString *)systemUptime
{
    NSNumber *Days, *Hours, *Minutes;
    NSProcessInfo * processInfo = [NSProcessInfo processInfo];
    NSTimeInterval UptimeInterval = [processInfo systemUptime];
    NSCalendar *Calendar = [NSCalendar currentCalendar];
    
    NSDate *Date = [[NSDate alloc] initWithTimeIntervalSinceNow:(0-UptimeInterval)];
    unsigned int unitFlags = NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute;
    NSDateComponents *Components = [Calendar components:unitFlags fromDate:Date toDate:[NSDate date]  options:0];
    
    Days = [NSNumber numberWithLong:[Components day]];
    Hours = [NSNumber numberWithLong:[Components hour]];
    Minutes = [NSNumber numberWithLong:[Components minute]];
    
    NSString *Uptime = [NSString stringWithFormat:@"%@天%@小时%@分",
                        [Days stringValue],
                        [Hours stringValue],
                        [Minutes stringValue]];
    if (!Uptime) {
        return @"";
    }
    return Uptime;
}

+ (NSString *)deviceModel
{
    if ([[UIDevice currentDevice] respondsToSelector:@selector(model)]) {
        NSString *deviceModel = [[UIDevice currentDevice] model];
        return deviceModel;
    } else {
        return @"";
    }
}

+ (NSString *)deviceName
{
    if ([[UIDevice currentDevice] respondsToSelector:@selector(name)]) {
        NSString *deviceName = [[UIDevice currentDevice] name];
        return deviceName;
    } else {
        return @"";
    }
}

+ (NSString *)systemVersion
{
    if ([[UIDevice currentDevice] respondsToSelector:@selector(systemVersion)]) {
        NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
        return systemVersion;
    } else {
        return @"";
    }
}

+ (NSString *)deviceModelType
{
    return [self systemDeviceTypeFormatted:NO];
}

+ (NSString *)deviceModelName
{
    return [self systemDeviceTypeFormatted:YES];
}

+ (NSString *)systemDeviceTypeFormatted:(BOOL)formatted
{
    NSString *DeviceType;
    if (formatted) {
        @try {
            NSString *NewDeviceType;
            struct utsname DT;
            uname(&DT);
            DeviceType = [NSString stringWithFormat:@"%s", DT.machine];
            
            if ([DeviceType isEqualToString:@"i386"])
                NewDeviceType = @"iPhone Simulator";
            else if ([DeviceType isEqualToString:@"x86_64"])
                NewDeviceType = @"iPhone Simulator";
            else if ([DeviceType isEqualToString:@"iPhone1,1"])
                NewDeviceType = @"iPhone";
            else if ([DeviceType isEqualToString:@"iPhone1,2"])
                NewDeviceType = @"iPhone 3G";
            else if ([DeviceType isEqualToString:@"iPhone2,1"])
                NewDeviceType = @"iPhone 3GS";
            else if ([DeviceType isEqualToString:@"iPhone3,1"])
                NewDeviceType = @"iPhone 4";
            else if ([DeviceType isEqualToString:@"iPhone4,1"])
                NewDeviceType = @"iPhone 4S";
            else if ([DeviceType isEqualToString:@"iPhone5,1"])
                NewDeviceType = @"iPhone 5(GSM)";
            else if ([DeviceType isEqualToString:@"iPhone5,2"])
                NewDeviceType = @"iPhone 5(GSM+CDMA)";
            else if ([DeviceType isEqualToString:@"iPhone5,3"])
                NewDeviceType = @"iPhone 5c(GSM)";
            else if ([DeviceType isEqualToString:@"iPhone5,4"])
                NewDeviceType = @"iPhone 5c(GSM+CDMA)";
            else if ([DeviceType isEqualToString:@"iPhone6,1"])
                NewDeviceType = @"iPhone 5s(GSM)";
            else if ([DeviceType isEqualToString:@"iPhone6,2"])
                NewDeviceType = @"iPhone 5s(GSM+CDMA)";
            else if ([DeviceType isEqualToString:@"iPhone7,1"])
                NewDeviceType = @"iPhone 6 Plus";
            else if ([DeviceType isEqualToString:@"iPhone7,2"])
                NewDeviceType = @"iPhone 6";
            else if ([DeviceType isEqualToString:@"iPhone8,1"])
                NewDeviceType = @"iPhone 6s";
            else if ([DeviceType isEqualToString:@"iPhone8,2"])
                NewDeviceType = @"iPhone 6s Plus";
            else if ([DeviceType isEqualToString:@"iPhone8,4"])
                NewDeviceType = @"iPhone SE";
            else if ([DeviceType isEqualToString:@"iPhone9,1"])
                NewDeviceType = @"iPhone 7";
            else if ([DeviceType isEqualToString:@"iPhone9,2"])
                NewDeviceType = @"iPhone 7 Plus";
            else if ([DeviceType isEqualToString:@"iPhone9,3"])
                NewDeviceType = @"iPhone 7";
            else if ([DeviceType isEqualToString:@"iPhone9,4"])
                NewDeviceType = @"iPhone 7 Plus";
            else if ([DeviceType isEqualToString:@"iPhone10,1"])
                NewDeviceType = @"iPhone 8";
            else if ([DeviceType isEqualToString:@"iPhone10,4"])
                NewDeviceType = @"iPhone 8";
            else if ([DeviceType isEqualToString:@"iPhone10,2"])
                NewDeviceType = @"iPhone 8 Plus";
            else if ([DeviceType isEqualToString:@"iPhone10,5"])
                NewDeviceType = @"iPhone 8 Plus";
            else if ([DeviceType isEqualToString:@"iPhone10,3"])
                NewDeviceType = @"iPhone X";
            else if ([DeviceType isEqualToString:@"iPhone10,6"])
                NewDeviceType = @"iPhone X";
            else if ([DeviceType isEqualToString:@"iPod1,1"])
                NewDeviceType = @"iPod Touch 1G";
            else if ([DeviceType isEqualToString:@"iPod2,1"])
                NewDeviceType = @"iPod Touch 2G";
            else if ([DeviceType isEqualToString:@"iPod3,1"])
                NewDeviceType = @"iPod Touch 3G";
            else if ([DeviceType isEqualToString:@"iPod4,1"])
                NewDeviceType = @"iPod Touch 4G";
            else if ([DeviceType isEqualToString:@"iPod5,1"])
                NewDeviceType = @"iPod Touch 5G";
            else if ([DeviceType isEqualToString:@"iPod7,1"])
                NewDeviceType = @"iPod Touch 6G";
            else if ([DeviceType isEqualToString:@"iPad1,1"])
                NewDeviceType = @"iPad";
            else if ([DeviceType isEqualToString:@"iPad2,1"])
                NewDeviceType = @"iPad 2(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad2,2"])
                NewDeviceType = @"iPad 2(GSM)";
            else if ([DeviceType isEqualToString:@"iPad2,3"])
                NewDeviceType = @"iPad 2(CDMA)";
            else if ([DeviceType isEqualToString:@"iPad2,4"])
                NewDeviceType = @"iPad 2(WiFi + New Chip)";
            else if ([DeviceType isEqualToString:@"iPad2,5"])
                NewDeviceType = @"iPad mini(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad2,6"])
                NewDeviceType = @"iPad mini(GSM)";
            else if ([DeviceType isEqualToString:@"iPad2,7"])
                NewDeviceType = @"iPad mini(GSM+CDMA)";
            else if ([DeviceType isEqualToString:@"iPad3,1"])
                NewDeviceType = @"iPad 3(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad3,2"])
                NewDeviceType = @"iPad 3(GSM+CDMA)";
            else if ([DeviceType isEqualToString:@"iPad3,3"])
                NewDeviceType = @"iPad 3(GSM)";
            else if ([DeviceType isEqualToString:@"iPad3,4"])
                NewDeviceType = @"iPad 4(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad3,5"])
                NewDeviceType = @"iPad 4(GSM)";
            else if ([DeviceType isEqualToString:@"iPad3,6"])
                NewDeviceType = @"iPad 4(GSM+CDMA)";
            else if ([DeviceType isEqualToString:@"iPad3,3"])
                NewDeviceType = @"New iPad";
            else if ([DeviceType isEqualToString:@"iPad4,1"])
                NewDeviceType = @"iPad Air(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad4,2"])
                NewDeviceType = @"iPad Air(Cellular)";
            else if ([DeviceType isEqualToString:@"iPad4,4"])
                NewDeviceType = @"iPad mini 2(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad4,5"])
                NewDeviceType = @"iPad mini 2(Cellular)";
            else if ([DeviceType isEqualToString:@"iPad5,1"])
                NewDeviceType = @"iPad mini 4(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad5,2"])
                NewDeviceType = @"iPad mini 4(Cellular)";
            else if ([DeviceType isEqualToString:@"iPad5,4"])
                NewDeviceType = @"iPad Air 2(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad5,5"])
                NewDeviceType = @"iPad Air 2(Cellular)";
            else if ([DeviceType isEqualToString:@"iPad6,3"])
                NewDeviceType = @"9.7-inch iPad Pro(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad6,4"])
                NewDeviceType = @"9.7-inch iPad Pro(Cellular)";
            else if ([DeviceType isEqualToString:@"iPad6,7"])
                NewDeviceType = @"12.9-inch iPad Pro(WiFi)";
            else if ([DeviceType isEqualToString:@"iPad6,8"])
                NewDeviceType = @"12.9-inch iPad Pro(Cellular)";
            else if ([DeviceType hasPrefix:@"iPad"])
                NewDeviceType = @"iPad";
            else
                NewDeviceType = DeviceType;
            return NewDeviceType;
        }
        @catch (NSException *exception) {
            return @"";
        }
    } else {
        @try {
            struct utsname DT;
            uname(&DT);
            DeviceType = [NSString stringWithFormat:@"%s", DT.machine];
            return DeviceType;
        }
        @catch (NSException *exception) {
            return @"";
        }
    }
}

+ (NSString *)screenBrightness
{
    @try{
        float brightness = [UIScreen mainScreen].brightness;
        if (brightness < 0.0 || brightness > 1.0) {
            return @"-1";
        }
        return [NSString stringWithFormat:@"%.2f%%",(brightness * 100)];
    }
    @catch (NSException *exception) {
        return @"-1";
    }
}

+ (NSString *)batteryLevel
{
    @try {
        UIDevice *Device = [UIDevice currentDevice];
        Device.batteryMonitoringEnabled = YES;
        float BatteryLevel = 0.0;
        float BatteryCharge = [Device batteryLevel];
        if (BatteryCharge > 0.0f) {
            BatteryLevel = BatteryCharge * 100;
        } else {
            return @"-1";
        }
        return [NSString stringWithFormat:@"%.2f%%",BatteryLevel];
    }
    @catch (NSException *exception) {
        return @"-1";
    }
}

+ (BOOL)charging
{
    @try {
        UIDevice *Device = [UIDevice currentDevice];
        Device.batteryMonitoringEnabled = YES;
        if ([Device batteryState] == UIDeviceBatteryStateCharging || [Device batteryState] == UIDeviceBatteryStateFull) {
            return true;
        } else {
            return false;
        }
    }
    @catch (NSException *exception) {
        return false;
    }
}

+ (BOOL)fullyCharged
{
    @try {
        UIDevice *Device = [UIDevice currentDevice];
        Device.batteryMonitoringEnabled = YES;
        if ([Device batteryState] == UIDeviceBatteryStateFull) {
            return true;
        } else {
            return false;
        }
    }
    @catch (NSException *exception) {
        return false;
    }
}

+ (BOOL)jailbroken
{
    return NOTJAIL==[self isJailbrokened]?NO:YES;
}

+ (NSString *)carrierName
{
    @try {
        CTTelephonyNetworkInfo *TelephonyInfo = [[CTTelephonyNetworkInfo alloc] init];
        CTCarrier *Carrier = [TelephonyInfo subscriberCellularProvider];
        NSString *CarrierName = [Carrier carrierName];
        if (CarrierName == nil || CarrierName.length <= 0) {
            return @"";
        }
        return CarrierName;
    }
    @catch (NSException *exception) {
        return @"";
    }
}


+ (NSString *)diskSpace {
    @try {
        long long Space = [self longDiskSpace];
        if (Space <= 0) {
            return @"";
        }
        NSString *DiskSpace = [self formatMemory:Space];
        if (DiskSpace == nil || DiskSpace.length <= 0) {
            return @"";
        }
        return DiskSpace;
    }
    @catch (NSException * ex) {
        return @"";
    }
}

+ (NSString *)freeDiskSpaceInPercent
{
    return [self freeDiskSpace:YES];
}

+ (NSString *)freeDiskSpanceInRaw
{
    return [self freeDiskSpace:NO];
}

+ (NSString *)freeDiskSpace:(BOOL)inPercent {
    @try {
        long long Space = [self longFreeDiskSpace];
        if (Space <= 0) {
            return @"";
        }
        NSString *DiskSpace;
        if (inPercent) {
            long long TotalSpace = [self longDiskSpace];
            float PercentDiskSpace = (Space * 100) / TotalSpace;
            if (PercentDiskSpace <= 0) {
                return @"";
            }
            DiskSpace = [NSString stringWithFormat:@"%.f%%", PercentDiskSpace];
        } else {
            DiskSpace = [self formatMemory:Space];
        }
        if (DiskSpace == nil || DiskSpace.length <= 0) {
            return @"";
        }
        return DiskSpace;
    }
    @catch (NSException * ex) {
        return @"";
    }
}

+ (NSString *)usedDiskSpaceInPercent
{
    return [self usedDiskSpace:YES];
}

+ (NSString *)usedDiskSpanceInRaw
{
    return [self usedDiskSpace:NO];
}

+ (NSString *)usedDiskSpace:(BOOL)inPercent {
    @try {
        long long UDS;
        long long TDS = [self longDiskSpace];
        long long FDS = [self longFreeDiskSpace];
        if (TDS <= 0 || FDS <= 0) {
            return @"";
        }
        UDS = TDS - FDS;
        if (UDS <= 0) {
            return @"";
        }
        NSString *UsedDiskSpace;
        if (inPercent) {
            float PercentUsedDiskSpace = (UDS * 100) / TDS;
            if (PercentUsedDiskSpace <= 0) {
                return @"";
            }
            UsedDiskSpace = [NSString stringWithFormat:@"%.f%%", PercentUsedDiskSpace];
        } else {
            UsedDiskSpace = [self formatMemory:UDS];
        }
        if (UsedDiskSpace == nil || UsedDiskSpace.length <= 0) {
            return @"";
        }
        return UsedDiskSpace;
    }
    @catch (NSException *exception) {
        return @"";
    }
}

+ (long long)longDiskSpace {
    @try {
        long long DiskSpace = 0L;
        NSError *Error = nil;
        NSDictionary *FileAttributes = [[NSFileManager defaultManager] attributesOfFileSystemForPath:NSHomeDirectory() error:&Error];
        if (Error == nil) {
            DiskSpace = [[FileAttributes objectForKey:NSFileSystemSize] longLongValue];
        } else {
            return -1;
        }
        if (DiskSpace <= 0) {
            return -1;
        }
        return DiskSpace;
    }
    @catch (NSException *exception) {
        return -1;
    }
}

+ (long long)longFreeDiskSpace {
    @try {
        long long FreeDiskSpace = 0L;
        NSError *Error = nil;
        NSDictionary *FileAttributes = [[NSFileManager defaultManager] attributesOfFileSystemForPath:NSHomeDirectory() error:&Error];
        if (Error == nil) {
            FreeDiskSpace = [[FileAttributes objectForKey:NSFileSystemFreeSize] longLongValue];
        } else {
            return -1;
        }
        if (FreeDiskSpace <= 0) {
            return -1;
        }
        return FreeDiskSpace;
    }
    @catch (NSException *exception) {
        return -1;
    }
}

+ (NSString *)formatMemory:(long long)Space {
    @try {
        NSString *FormattedBytes = nil;
        double NumberBytes = 1.0 * Space;
        double TotalGB = NumberBytes / GB;
        double TotalMB = NumberBytes / MB;
        if (TotalGB >= 1.0) {
            FormattedBytes = [NSString stringWithFormat:@"%.2f GB", TotalGB];
        } else if (TotalMB >= 1)
            FormattedBytes = [NSString stringWithFormat:@"%.2f MB", TotalMB];
        else {
            FormattedBytes = [self formattedMemory:Space];
            FormattedBytes = [FormattedBytes stringByAppendingString:@" bytes"];
        }
        if (FormattedBytes == nil || FormattedBytes.length <= 0) {
            return @"";
        }
        return FormattedBytes;
    }
    @catch (NSException *exception) {
        return @"";
    }
}

+ (NSString *)formattedMemory:(unsigned long long)Space {
    @try {
        NSString *FormattedBytes = nil;
        NSNumberFormatter *Formatter = [[NSNumberFormatter alloc] init];
        [Formatter setPositiveFormat:@"###,###,###,###"];
        NSNumber * theNumber = [NSNumber numberWithLongLong:Space];
        FormattedBytes = [Formatter stringFromNumber:theNumber];
        if (FormattedBytes == nil || FormattedBytes.length <= 0) {
            return @"";
        }
        return FormattedBytes;
    }
    @catch (NSException *exception) {
        return @"";
    }
}

+ (NSString *)IDFA
{
    return [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString];
}

+ (NSString *)IDFV
{
    return [[[UIDevice currentDevice] identifierForVendor] UUIDString];
}

@end

@implementation DeviceInfo (JailbreakCheck)

+ (int)isJailbrokened {
    // Is the device jailbroken?
    
    // Make an int to monitor how many checks are failed
    int motzart = 0;
    
    // Check if iOS 8 or lower
    if (SYSTEM_VERSION_LESS_THAN(@"9.0")) {
        // URL Check
        if ([self urlCheck] != NOTJAIL) {
            // Jailbroken
            motzart += 3;
        }
    }
    
    // Cydia Check
    if ([self cydiaCheck] != NOTJAIL) {
        // Jailbroken
        motzart += 3;
    }
    
    // Inaccessible Files Check
    if ([self inaccessibleFilesCheck] != NOTJAIL) {
        // Jailbroken
        motzart += 2;
    }
    
    // Plist Check
    if ([self plistCheck] != NOTJAIL) {
        // Jailbroken
        motzart += 2;
    }
    
    // Check if iOS 8 or lower
    if (SYSTEM_VERSION_LESS_THAN(@"9.0")) {
        // Processes Check
        if ([self processesCheck] != NOTJAIL) {
            // Jailbroken
            motzart += 2;
        }
        
        // FSTab Check
        if ([self fstabCheck] != NOTJAIL) {
            // Jailbroken
            motzart += 1;
        }
        
        // Shell Check
        if ([self systemCheck] != NOTJAIL) {
            // Jailbroken
            motzart += 2;
        }
    }
    
    // Symbolic Link Check
    if ([self symbolicLinkCheck] != NOTJAIL) {
        // Jailbroken
        motzart += 2;
    }
    
    // FilesExist Integrity Check
    if ([self filesExistCheck] != NOTJAIL) {
        // Jailbroken
        motzart += 2;
    }
    
    // Check if the Jailbreak Integer is 3 or more
    if (motzart >= 3) {
        // Jailbroken
        return KFJailbroken;
    }
    
    // Not Jailbroken
    return NOTJAIL;
}

#pragma mark - Static Jailbreak Checks

// UIApplication CanOpenURL Check
+ (int)urlCheck {
    @try {
        // Create a fake url for cydia
        NSURL *FakeURL = [NSURL URLWithString:CYDIAPACKAGE];
        // Return whether or not cydia's openurl item exists
        if ([[UIApplication sharedApplication] canOpenURL:FakeURL])
            return KFOpenURL;
        else
            return NOTJAIL;
    }
    @catch (NSException *exception) {
        // Error, return false
        return NOTJAIL;
    }
}

// Cydia Check
+ (int)cydiaCheck {
    @try {
        // Create a file path string
        NSString *filePath = CYDIALOC;
        // Check if it exists
        if ([[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
            // It exists
            return KFCydia;
        } else {
            // It doesn't exist
            return NOTJAIL;
        }
    }
    @catch (NSException *exception) {
        // Error, return false
        return NOTJAIL;
    }
}

// Inaccessible Files Check
+ (int)inaccessibleFilesCheck {
    @try {
        // Run through the array of files
        for (NSString *key in HIDDENFILES) {
            // Check if any of the files exist (should return no)
            if ([[NSFileManager defaultManager] fileExistsAtPath:key]) {
                // Jailbroken
                return KFIFC;
            }
        }
        
        // Shouldn't get this far, return jailbroken
        return NOTJAIL;
    }
    @catch (NSException *exception) {
        // Error, return false
        return NOTJAIL;
    }
}

// Plist Check
+ (int)plistCheck {
    @try {
        // Define the Executable name
        NSString *ExeName = EXEPATH;
        NSDictionary *ipl = PLISTPATH;
        // Check if the plist exists
        if ([FILECHECK ExeName] == FALSE || ipl == nil || ipl.count <= 0) {
            // Executable file can't be found and the plist can't be found...hmmm
            return KFPlist;
        } else {
            // Everything is good
            return NOTJAIL;
        }
    }
    @catch (NSException *exception) {
        // Error, return false
        return NOTJAIL;
    }
}

// Running Processes Check
+ (int)processesCheck {
    @try {
        // Make a processes array
        NSArray *processes = [self runningProcesses];
        
        // Check for Cydia in the running processes
        for (NSDictionary * dict in processes) {
            // Define the process name
            NSString *process = [dict objectForKey:@"ProcessName"];
            // If the process is this executable
            if ([process isEqualToString:CYDIA]) {
                // Return Jailbroken
                return KFProcessesCydia;
            } else if ([process isEqualToString:OTHERCYDIA]) {
                // Return Jailbroken
                return KFProcessesOtherCydia;
            } else if ([process isEqualToString:OOCYDIA]) {
                // Return Jailbroken
                return KFProcessesOtherOCydia;
            }
        }
        
        // Not Jailbroken
        return NOTJAIL;
    }
    @catch (NSException *exception) {
        // Error
        return NOTJAIL;
    }
}

// FSTab Size
+ (int)fstabCheck {
    @try {
        struct stat sb;
        stat("/etc/fstab", &sb);
        long long size = sb.st_size;
        if (size == 80) {
            // Not jailbroken
            return NOTJAIL;
        } else
            // Jailbroken
            return KFFSTab;
    }
    @catch (NSException *exception) {
        // Not jailbroken
        return NOTJAIL;
    }
}

// System() available
+ (int)systemCheck {
    @try {
        // See if the system call can be used
//        if (system(0)) {
//            // Jailbroken
//            return KFSystem;
//        } else
            // Not Jailbroken
            return NOTJAIL;
    }
    @catch (NSException *exception) {
        // Not Jailbroken
        return NOTJAIL;
    }
}

// Symbolic Link available
+ (int)symbolicLinkCheck {
    @try {
        // See if the Applications folder is a symbolic link
        struct stat s;
        if (lstat("/Applications", &s) != 0) {
            if (s.st_mode & S_IFLNK) {
                // Device is jailbroken
                return KFSymbolic;
            } else
                // Not jailbroken
                return NOTJAIL;
        } else {
            // Not jailbroken
            return NOTJAIL;
        }
    }
    @catch (NSException *exception) {
        // Not Jailbroken
        return NOTJAIL;
    }
}

// FileSystem working correctly?
+ (int)filesExistCheck {
    @try {
        // Check if filemanager is working
        if (![FILECHECK [[NSBundle mainBundle] executablePath]]) {
            // Jailbroken and trying to hide it
            return KFFileExists;
        } else
            // Not Jailbroken
            return NOTJAIL;
    }
    @catch (NSException *exception) {
        // Not Jailbroken
        return NOTJAIL;
    }
}

// Get the running processes
+ (NSArray *)runningProcesses {
    // Define the int array of the kernel's processes
    int mib[4] = {CTL_KERN, KERN_PROC, KERN_PROC_ALL, 0};
    size_t miblen = 4;
    
    // Make a new size and int of the sysctl calls
    size_t size = 0;
    int st;
    
    // Make new structs for the processes
    struct kinfo_proc * process = NULL;
    struct kinfo_proc * newprocess = NULL;
    
    // Do get all the processes while there are no errors
    do {
        // Add to the size
        size += (size / 10);
        // Get the new process
        newprocess = realloc(process, size);
        // If the process selected doesn't exist
        if (!newprocess){
            // But the process exists
            if (process){
                // Free the process
                free(process);
            }
            // Return that nothing happened
            return nil;
        }
        
        // Make the process equal
        process = newprocess;
        
        // Set the st to the next process
        st = sysctl(mib, (int)miblen, process, &size, NULL, 0);
        
    } while (st == -1 && errno == ENOMEM);
    
    // As long as the process list is empty
    if (st == 0){
        
        // And the size of the processes is 0
        if (size % sizeof(struct kinfo_proc) == 0){
            // Define the new process
            int nprocess = (int)(size / sizeof(struct kinfo_proc));
            // If the process exists
            if (nprocess){
                // Create a new array
                NSMutableArray * array = [[NSMutableArray alloc] init];
                // Run through a for loop of the processes
                for (int i = nprocess - 1; i >= 0; i--){
                    // Get the process ID
                    NSString * processID = [[NSString alloc] initWithFormat:@"%d", process[i].kp_proc.p_pid];
                    // Get the process Name
                    NSString * processName = [[NSString alloc] initWithFormat:@"%s", process[i].kp_proc.p_comm];
                    // Get the process Priority
                    NSString *processPriority = [[NSString alloc] initWithFormat:@"%d", process[i].kp_proc.p_priority];
                    // Get the process running time
                    NSDate   *processStartDate = [NSDate dateWithTimeIntervalSince1970:process[i].kp_proc.p_un.__p_starttime.tv_sec];
                    // Create a new dictionary containing all the process ID's and Name's
                    NSDictionary *dict = [[NSDictionary alloc] initWithObjects:[NSArray arrayWithObjects:processID, processPriority, processName, processStartDate, nil]
                                                                       forKeys:[NSArray arrayWithObjects:@"ProcessID", @"ProcessPriority", @"ProcessName", @"ProcessStartDate", nil]];
                    
                    // Add the dictionary to the array
                    [array addObject:dict];
                }
                // Free the process array
                free(process);
                
                // Return the process array
                return array;
                
            }
        }
    }
    
    // Free the process array
    free(process);
    
    // If no processes are found, return nothing
    return nil;
}

@end
