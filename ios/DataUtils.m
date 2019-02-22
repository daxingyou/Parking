//
//  DataUtils.m
//  LittleBee
//
//  Created by diaolong on 15/9/17.
//
//

#import "DataUtils.h"

BOOL isString(id obj) {
    return [obj isKindOfClass:[NSString class]];
}

BOOL isArray(id obj) {
    return [obj isKindOfClass:[NSArray class]];
}

BOOL isEmptyString(NSString *string) {
    if (string == nil || string == NULL || [string isKindOfClass:[NSNull class]]) {
        return true;
    }
    if ([string isKindOfClass:[NSString class]] && [[string stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] length] == 0) {
        return true;
    }
    return false;
}

BOOL isNotEmptyString(NSString *string) {
    return !isEmptyString(string);
}

NSArray *arrayFromObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return [NSArray array];
    }
    
    id object = [dictionary valueForKey:key];
    if ([object isKindOfClass:[NSString class]] &&
        (isEmptyString(object) || [@"<null>" isEqualToString:object])) {
        return [NSArray array];
    }
    
    if ([object isKindOfClass:[NSArray class]]) {
        return object;
    }
    
    return [NSArray array];
}

NSDictionary *dictionaryFromObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return [NSDictionary dictionary];
    }
    
    id object = [dictionary valueForKey:key];
    if ([object isKindOfClass:[NSString class]] &&
        (isEmptyString(object) || [@"<null>" isEqualToString:object])) {
        return [NSDictionary dictionary];
    }
    
    if ([object isKindOfClass:[NSDictionary class]]) {
        return object;
    }
    
    return [NSDictionary dictionary];
}

NSString *stringFromObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return @"";
    }
    
    id object = [dictionary valueForKey:key];
    if ([object isKindOfClass:[NSString class]] &&
        (isEmptyString(object) || [@"<null>" isEqualToString:object])) {
        return @"";
    }
    
    if ([object isKindOfClass:[NSString class]]) {
        return object;
    } else if ([object isKindOfClass:[NSNumber class]]) {
        return [object stringValue];
    }
    
    return @"";
}

int integerFromObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return 0;
    }
    
    id object = [dictionary valueForKey:key];
    if (!object || !([object isKindOfClass:[NSNumber class]] || [object isKindOfClass:[NSString class]])) {
        return 0;
    }
    
    return [object intValue];
}

BOOL boolFromObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return 0;
    }
    
    id object = [dictionary valueForKey:key];
    if (!object || !([object isKindOfClass:[NSNumber class]] || [object isKindOfClass:[NSString class]])) {
        return 0;
    }
    
    return [object boolValue];
}

int integerFromObjectPoll(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return 1000;
    }
    
    id object = [dictionary valueForKey:key];
    if (!object || !([object isKindOfClass:[NSNumber class]] || [object isKindOfClass:[NSString class]])) {
        return 1000;
    }
    
    return [object intValue];
}

CGFloat floatFromObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return 0.0;
    }
    
    id object = [dictionary valueForKey:key];
    if (!object || !([object isKindOfClass:[NSNumber class]] || [object isKindOfClass:[NSString class]])) {
        return 0.0;
    }
    
    return [object floatValue];
}

double doubleFromObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return 0.0;
    }
    
    id object = [dictionary valueForKey:key];
    if (!object || !([object isKindOfClass:[NSNumber class]] || [object isKindOfClass:[NSString class]])) {
        return 0.0;
    }
    
    return [object doubleValue];
}

NSDate *dateFromeObject(NSDictionary *dictionary, NSString *key) {
    if (!dictionary || ![dictionary isKindOfClass:[NSDictionary class]]) {
        return nil;
    }
    
    id object = [dictionary valueForKey:key];
    if (!object || !([object isKindOfClass:[NSNumber class]] || [object isKindOfClass:[NSString class]])) {
        return nil;
    }
    
    return [NSDate dateWithTimeIntervalSince1970:[object doubleValue]];
}

BOOL isEqualString(NSString *string1, NSString *string2) {
    BOOL isEmpty = isEmptyString(string1);
    if (isEmpty && isEmptyString(string2)) {
        return YES;
    }
    
    if (isEmpty) {
        return NO;
    }
    
    return [string1 isEqualToString:string2];
}

@implementation DataUtils

+ (BOOL)canOpenURL:(NSString *)urlString {
    return [[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:urlString]];
}

+ (void)openURL:(NSString *)urlString {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:urlString]];
}


/**
 *  截屏
 */
+ (UIImage *)takeScreenShot {
    // Create a graphics context with the target size
    // On iOS 4 and later, use UIGraphicsBeginImageContextWithOptions to take the scale into consideration
    // On iOS prior to 4, fall back to use UIGraphicsBeginImageContext
    CGSize imageSize = [[UIScreen mainScreen] bounds].size;
    
    UIGraphicsBeginImageContextWithOptions(imageSize, NO, 0);
 
    
    CGContextRef context = UIGraphicsGetCurrentContext();
    
    // Iterate over every window from back to front
    for (UIWindow *window in [[UIApplication sharedApplication] windows]) {
        if (![window respondsToSelector:@selector(screen)] || [window screen] == [UIScreen mainScreen]) {
            // -renderInContext: renders in the coordinate space of the layer,
            // so we must first apply the layer's geometry to the graphics context
            CGContextSaveGState(context);
            // Center the context around the window's anchor point
            CGContextTranslateCTM(context, [window center].x, [window center].y);
            // Apply the window's transform about the anchor point
            CGContextConcatCTM(context, [window transform]);
            // Offset by the portion of the bounds left of and above the anchor point
            CGContextTranslateCTM(context,
                                  -[window bounds].size.width * [[window layer] anchorPoint].x,
                                  -[window bounds].size.height * [[window layer] anchorPoint].y);
            
            // Render the layer hierarchy to the current context
            [[window layer] renderInContext:context];
            
            // Restore the context
            CGContextRestoreGState(context);
        }
    }
    
    // Retrieve the screenshot image
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    
    UIGraphicsEndImageContext();
    
    return image;
}


/**
 *  NSUserDefaults
 */

+ (void)localStorageCustomObj:(id)obj withName:(NSString *)name {
    NSUserDefaults *defaultstore=[[NSUserDefaults alloc]init];
    NSData *data = [NSKeyedArchiver archivedDataWithRootObject:obj];
    [defaultstore setValue:data forKey:name];
    [defaultstore synchronize];
}

+ (void)clearStorageWithName:(NSString *)name {
    NSUserDefaults *defaultstore=[[NSUserDefaults alloc]init];
    [defaultstore removeObjectForKey:name];
    [defaultstore synchronize];
}

+ (id)getLocalStorageCustomObj:(NSString *)name {
    NSUserDefaults *user=[[NSUserDefaults alloc]init];
    NSData *data =[user objectForKey:name];
    
    if(data!=nil) {
        return  [NSKeyedUnarchiver unarchiveObjectWithData:data];
    } else {
        return nil;
    }
}

/**
 *  手机或者固话号码判断
 */

+ (BOOL)isMobileNumber:(NSString *)mobileNum {
    /**
     * 大陆地区固话及小灵通
     * 区号：010,020,021,022,023,024,025,027,028,029
     * 号码：七位或八位
     */
    // NSString * PHS = @"^0(10|2[0-5789]|\\d{3})\\d{7,8}$";
    
    
    NSString *CG = @"^((0\\d{2,3})\\-)?(\\d{7,8})?(\\-(\\d{3,}))?$";
    
    NSPredicate *regextestcCG = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", CG];
    return ([regextestcCG evaluateWithObject:mobileNum]) || [DataUtils isMobilePhoneNumber:mobileNum];
}

+ (BOOL)isMobilePhoneNumber:(NSString *)mobileNum {
    /**
     * 手机号码
     * 移动：134[0-8],135,136,137,138,139,150,151,157,158,159,182,187,188,184 补充 152,178，183
     * 联通：130,131,132,155,156,185,186 补充 176,145,147 删除 152
     * 电信：133,1349,153,180,189,181  补充 170,177,134
     */
    //    NSString * MOBILE = @"^1(3[0-9]|5[0-9]|8[0-9])\\d{8}$";
    /**
     * 中国移动：China Mobile
     * 134[0-8],135,136,137,138,139,150,151,157,158,159,182,187,188,184 补充 152,178，183
     */
    NSString * CM = @"^((\\+86)|(\\(\\+86\\))|(86))?(1(34(\\-)?[0-8]|3[5-9](\\-)?[0-9]|5[0-27-9](\\-)?[0-9]|8[2-478](\\-)?[0-9]|7[8](\\-)?[0-9]))\\d{3}(\\-?)\\d{4}$";
    /**
     * 中国联通：China Unicom
     * 130,131,132,152,155,156,185,186 补充 176,145,147 删除 152
     */
    NSString * CU = @"^((\\+86)|(\\(\\+86\\))|(86))?(1(3[0-2]|5[56]|8[56]|7[6]|4[57]))(\\-)?\\d{4}(\\-)?\\d{4}$";
    /**
     * 中国电信：China Telecom
     * 133,1349,153,180,189,1811 补充 170,177,134,181
     */
    NSString * CT = @"^((\\+86)|(\\(\\+86\\))|(86))?(1(3[34]|53|8[019]|7[07]))(\\-)?\\d{4}(\\-)?\\d{4}$";
    /**
     * 大陆地区固话及小灵通
     * 区号：010,020,021,022,023,024,025,027,028,029
     * 号码：七位或八位
     */
    // NSString * PHS = @"^0(10|2[0-5789]|\\d{3})\\d{7,8}$";
    
    
    
    //实现手机号前带86或是+86的情况:
    NSString * C86  = @"^((\\+86)|(\\(\\+86\\))|(86))?(1(3[0-9]|5[0-35-9]|8[0-9]))(\\-)?\\d{4}(\\-)?\\d{4}$";
    
    
    
    //    NSPredicate *regextestmobile = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", MOBILE];
    NSPredicate *regextestcm = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", CM];
    NSPredicate *regextestcu = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", CU];
    NSPredicate *regextestct = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", CT];
    NSPredicate *regextestc86 = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", C86];
    
    if (/*([regextestmobile evaluateWithObject:mobileNum] == YES)
         || */([regextestcm evaluateWithObject:mobileNum] == YES)
        || ([regextestct evaluateWithObject:mobileNum] == YES)
        || ([regextestcu evaluateWithObject:mobileNum] == YES)
        || ([regextestc86 evaluateWithObject:mobileNum] == YES)) {
        return YES;
    } else {
        return NO;
    }
}


+(NSString *)getRequestPhoneNumer:(NSString *)phoneNumber {
    if (isEmptyString(phoneNumber)) {
        return nil;
    }
    
    phoneNumber = [phoneNumber stringByReplacingOccurrencesOfString:@"-" withString:@""];
    phoneNumber = [phoneNumber stringByReplacingOccurrencesOfString:@" " withString:@""];
    phoneNumber = [phoneNumber stringByReplacingOccurrencesOfString:@"(+86)" withString:@""];
    phoneNumber = [phoneNumber stringByReplacingOccurrencesOfString:@"+86" withString:@""];
    phoneNumber = [phoneNumber stringByReplacingOccurrencesOfString:@"(" withString:@""];
    phoneNumber = [phoneNumber stringByReplacingOccurrencesOfString:@")" withString:@""];
    phoneNumber = [phoneNumber stringByReplacingOccurrencesOfString:@" " withString:@""];
    
    
    if ([phoneNumber hasPrefix:@"86"] && [phoneNumber length] == 13) {
        phoneNumber = [phoneNumber substringFromIndex:2];
    }
    return phoneNumber;
}

+ (BOOL)isSimplePhoneNumber:(NSString *)mobileNum {
    mobileNum = [mobileNum stringByReplacingOccurrencesOfString:@"-" withString:@""];
    mobileNum = [mobileNum stringByReplacingOccurrencesOfString:@"(" withString:@""];
    mobileNum = [mobileNum stringByReplacingOccurrencesOfString:@")" withString:@""];
    mobileNum = [mobileNum stringByReplacingOccurrencesOfString:@" " withString:@""];
    
    NSString * C86  = @"^(\\+86)|(\\(\\+86\\))|(86)?\\d{11}$";
    NSPredicate *regextestc86 = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", C86];
    
    if ([regextestc86 evaluateWithObject:mobileNum] == YES) {
        return YES;
    } else {
        return NO;
    }
}

/**
 *  获取有效的size
 */

+ (CGSize)ceilSize:(CGSize)size {
    size = CGSizeMake(ceil(size.width), ceil(size.height));
    return size;
}


/**
 *  缩放图片质量
 */
+ (NSData *)imageCompressionQuality:(UIImage *)image imageLenth:(CGFloat)lenth {
    
    float compressionQuality = 1;
    NSData *imageData = UIImageJPEGRepresentation(image, compressionQuality);
    while (true) {
        if (imageData.length / 1024<= lenth || compressionQuality <= 0.1) {
            break;
        }
        compressionQuality -= 0.1;
        imageData = UIImageJPEGRepresentation(image, compressionQuality);
    }
    return imageData;
}



/**
 *  string drawing attributes
 */

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font {
    
    return [self attributesWithFont:font
                      lineBreakMode:NSLineBreakByWordWrapping];
}

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                                  textColor:(UIColor *)color {
    
    return [self attributesWithFont:font
                      lineBreakMode:NSLineBreakByWordWrapping
                          alignment:NSTextAlignmentLeft
                          textColor:color];
}

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode {
    
    return [self attributesWithFont:font
                      lineBreakMode:breakMode
                          alignment:NSTextAlignmentLeft];
}

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                                  alignment:(NSTextAlignment)alignment {
    
    return [self attributesWithFont:font
                      lineBreakMode:NSLineBreakByWordWrapping
                          alignment:alignment];
}

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                                  textColor:(UIColor *)color
                                  alignment:(NSTextAlignment)alignment
                             baseLineOffset:(CGFloat)offset {
    
    NSMutableDictionary *attributes = [self attributesWithFont:font
                                                 lineBreakMode:NSLineBreakByWordWrapping
                                                     alignment:alignment
                                                     textColor:color];
    attributes[NSBaselineOffsetAttributeName] = @(offset);
    return attributes;
}

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode
                                  alignment:(NSTextAlignment)alignment {
    
    return [self attributesWithFont:font
                      lineBreakMode:breakMode
                          alignment:alignment
                          textColor:[UIColor blackColor]];
}

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode
                                  alignment:(NSTextAlignment)alignment
                                  textColor:(UIColor *)color {
    
    NSMutableParagraphStyle *style = [[NSParagraphStyle defaultParagraphStyle] mutableCopy];
    style.lineBreakMode = breakMode;
    style.alignment = alignment;
    NSDictionary *dict = @{NSFontAttributeName: font,
                           NSParagraphStyleAttributeName: style,
                           NSForegroundColorAttributeName: color};
    return [NSMutableDictionary dictionaryWithDictionary:dict];
}

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode
                                  alignment:(NSTextAlignment)alignment
                                  textColor:(UIColor *)color
                                  underLine:(BOOL)hasUnderLine
                             underLineColor:(UIColor *)lineColor {
    
    NSMutableParagraphStyle *style = [[NSParagraphStyle defaultParagraphStyle] mutableCopy];
    style.lineBreakMode = breakMode;
    style.alignment = alignment;
    NSDictionary *dict = @{NSFontAttributeName: font,
                           NSParagraphStyleAttributeName: style,
                           NSForegroundColorAttributeName: color,
                           NSUnderlineStyleAttributeName: hasUnderLine ? @(NSUnderlineStyleSingle) : @(NSUnderlineStyleNone),
                           NSUnderlineColorAttributeName: lineColor ?: color
                           };
    return [NSMutableDictionary dictionaryWithDictionary:dict];
}

+ (NSString *)dataTOjsonString:(id)object {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:object
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];
    
    if (jsonData != nil && [jsonData length] > 0 && error == nil){
        return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }else{
        return nil;
    }
}



+ (id)jsonStringTOdata:(NSString *)jsonString {
    if (jsonString == nil) {
        return nil;
    }
    
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *err;
    id data = [NSJSONSerialization JSONObjectWithData:jsonData
                                                        options:NSJSONReadingMutableContainers
                                                          error:&err];
    if(err) {
        return nil;
    }
    return data;
}

+ (void)setStringToPasteboard:(NSString *)text {
    UIPasteboard *pastboard = [UIPasteboard generalPasteboard];
    [pastboard setString:text];
}

+ (NSString *)getStringFromPasteboard {
    UIPasteboard *pastboard = [UIPasteboard generalPasteboard];
    if (pastboard.numberOfItems > 0) {
        return pastboard.string;
    } else {
        return nil;
    }
}

@end
