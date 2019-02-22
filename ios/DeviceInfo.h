//
//  DeviceInfo.h
//  LittleBee
//
//  Created by gaoshilei on 2017/8/16.
//  Copyright © 2017年 weyao. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface DeviceInfo : NSObject

/**
 安装时间
 
 @return 2016年11月28日16时08分
 */
+ (NSString *)installTime;

/**
 包名
 
 @return com.company.app
 */
+ (NSString *)appBundleId;

/**
 WIFI的SSID
 
 @return zhanghong_3BCC
 */
+ (NSString *)SSID;

/**
 WIFI的BSSID
 
 @return 8c:a6:df:cb:3b:cc
 */
+ (NSString *)BSSID;

/**
 WIFI地址
 
 @return 192.168.0.110
 */
+ (NSString *)wifiIPAddress;

/**
 公网IP
 
 @return 218.129.10.23
 */
+ (NSString *)publicNetIp;

/**
 公网IP地理位置
 
 @return 上海市徐汇区
 */
+ (NSString *)publicNetAddress;

/**
 屏幕尺寸
 
 @return 320x568
 */
+ (NSString *)screenSize;

/**
 应用版本号
 
 @return 字符串格式的版本号
 */
+ (NSString *)appVersion;

/**
 应用名称
 
 @return 字符串格式的应用名称
 */
+ (NSString *)appName;

/**
 手机运行时间
 
 @return 1天20小时29分
 */
+ (NSString *)systemUptime;

/**
 设备型号
 
 @return iPhone
 */
+ (NSString *)deviceModel;

/**
 手机名称
 
 @return xxx的iPhone
 */
+ (NSString *)deviceName;

/**
 系统版本
 
 @return 10.1.1
 */
+ (NSString *)systemVersion;

/**
 手机类型
 
 @return iPhone8,2
 */
+ (NSString *)deviceModelType;

/**
 手机型号
 
 @return iPhone6S
 */
+ (NSString *)deviceModelName;

/**
 屏幕亮度
 
 @return 42.55%
 */
+ (NSString *)screenBrightness;

/**
 电池电量
 
 @return 83.00%
 */
+ (NSString *)batteryLevel;

/**
 是否在充电
 
 @return YES OR NO
 */
+ (BOOL)charging;

/**
 是否充满电
 
 @return YES OR NO
 */
+ (BOOL)fullyCharged;

/**
 是否越狱
 
 @return YES OR NO
 */
+ (BOOL)jailbroken;

/**
 运营商信息
 
 @return  中国移动 AT&T
 */
+ (NSString *)carrierName;

/**
 磁盘空间
 
 @return  12.59 GB
 */
+ (NSString *)diskSpace;

/**
 剩余磁盘空间（百分比）
 
 @return 67%
 */
+ (NSString *)freeDiskSpaceInPercent;

/**
 剩余磁盘空间（容量）
 
 @return 3.86 GB
 */
+ (NSString *)freeDiskSpanceInRaw;

/**
 已使用磁盘空间（百分比）
 
 @return 32%
 */
+ (NSString *)usedDiskSpaceInPercent;

/**
 已使用磁盘空间（容量）
 
 @return 8.06 GB
 */
+ (NSString *)usedDiskSpanceInRaw;

/**
 IDFA
 
 @return 049DEE57-D0AC-40CC-80BF-222B113F77F2
 */
+ (NSString *)IDFA;

/**
 UUID
 
 @return 297BB442-EAE6-4FD7-BB05-A144399CC2FA
 */
+ (NSString *)IDFV;

@end
