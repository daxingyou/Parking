//
//  DataUtils.h
//  LittleBee
//
//  Created by diaolong on 15/9/17.
//
//

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>


#if defined __cplusplus
extern "C" {
#endif
    BOOL isString(id obj);
    BOOL isArray(id obj);
    BOOL isEmptyString(NSString *string);
    BOOL isNotEmptyString(NSString *string);
    NSArray *arrayFromObject(NSDictionary *dictionary, NSString *key);
    NSDictionary *dictionaryFromObject(NSDictionary *dictionary, NSString *key);
    NSString *stringFromObject(NSDictionary *dictionary, NSString *key);
    int integerFromObject(NSDictionary *dictionary, NSString *key);
    BOOL boolFromObject(NSDictionary *dictionary, NSString *key);
    int integerFromObjectPoll(NSDictionary *dictionary, NSString *key);
    CGFloat floatFromObject(NSDictionary *dictionary, NSString *key);
    double doubleFromObject(NSDictionary *dictionary, NSString *key);
    NSDate *dateFromeObject(NSDictionary *dictionary, NSString *key);
    
    BOOL isEqualString(NSString *string1, NSString *string2);
#if defined __cplusplus
};
#endif

@interface DataUtils : NSObject

+ (BOOL)canOpenURL:(NSString *)urlString;
+ (void)openURL:(NSString *)urlString;

+ (UIImage *)takeScreenShot;                                        //截屏

+ (void)localStorageCustomObj:(id)obj withName:(NSString *)name;    //NSUserDefaults
+ (void)clearStorageWithName:(NSString *)name;
+ (id)getLocalStorageCustomObj:(NSString *)name;

+ (BOOL)isMobileNumber:(NSString *)mobileNum;                       //是否有效的电话号码
+ (BOOL)isMobilePhoneNumber:(NSString *)mobileNum;                  //是否有效的手机号
+ (NSString *)getRequestPhoneNumer:(NSString *)phoneNumber;         //去掉手机号中的“-”或+86之类的
+ (BOOL)isSimplePhoneNumber:(NSString *)mobileNum;

+ (CGSize)ceilSize:(CGSize)size;                                    //获取有效的size

+ (NSData *)imageCompressionQuality:(UIImage *)image
                         imageLenth:(CGFloat)lenth;                 //缩放图片质量

+ (NSString *)dataTOjsonString:(id)object;
+ (id)jsonStringTOdata:(NSString *)jsonString;

/* string drawing attributes */
+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font;

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                                  textColor:(UIColor *)color;

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode;

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                                  alignment:(NSTextAlignment)alignment;

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                                  textColor:(UIColor *)color
                                  alignment:(NSTextAlignment)alignment
                             baseLineOffset:(CGFloat)offset;

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode
                                  alignment:(NSTextAlignment)alignment;

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode
                                  alignment:(NSTextAlignment)alignment
                                  textColor:(UIColor *)color;

+ (NSMutableDictionary *)attributesWithFont:(UIFont *)font
                              lineBreakMode:(NSLineBreakMode)breakMode
                                  alignment:(NSTextAlignment)alignment
                                  textColor:(UIColor *)color
                                  underLine:(BOOL)hasUnderLine
                             underLineColor:(UIColor *)lineColor;

+ (void)setStringToPasteboard:(NSString *)text;
+ (NSString *)getStringFromPasteboard;

@end
