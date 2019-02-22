//
//  NSString+EncodingUTF8Additions.m
//  LittleBee
//
//  Created by wulingiOS on 16/11/14.
//  Copyright © 2016年 weyao. All rights reserved.
//

#import "NSString+EncodingUTF8Additions.h"

@implementation NSString (EncodingUTF8Additions)

- (NSString *)URLEncodingUTF8String {
    NSString *result = (NSString *)CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes(kCFAllocatorDefault,
                                                                                             (CFStringRef)self,
                                                                                             NULL,
                                                                                             CFSTR("!*'();:@&=+$,/?%#[]"),
                                                                                             kCFStringEncodingUTF8));
    return result;
}

- (NSString *)URLDecodingUTF8String {
    NSString *result = (NSString *)CFBridgingRelease(CFURLCreateStringByReplacingPercentEscapesUsingEncoding(kCFAllocatorDefault,
                                                                                                             (CFStringRef)self,
                                                                                                             CFSTR(""),
                                                                                                             kCFStringEncodingUTF8));
    return result;
}


- (NSString *)replaceUnicode {
    NSString *tempStr = [self stringByReplacingOccurrencesOfString:@"\\u" withString:@"\\U"];
    tempStr = [tempStr stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
    tempStr = [[@"\"" stringByAppendingString:tempStr] stringByAppendingString:@"\""];
    NSData *tempData = [tempStr dataUsingEncoding:NSUTF8StringEncoding];
    NSString* returnStr = [NSPropertyListSerialization propertyListWithData:tempData
                                                                    options:NSPropertyListImmutable
                                                                     format:NULL
                                                                      error:NULL];
    
    return [returnStr stringByReplacingOccurrencesOfString:@"\\r\\n" withString:@"\n"];
}

- (NSString *)UnicodeString {
    NSUInteger length = [self length];
    NSMutableString *s = [NSMutableString stringWithCapacity:0];
    for (int i = 0;i < length; i++){
        unichar _char = [self characterAtIndex:i];
        //判断是否为英文和数字
        if (_char <= '9' && _char >='0'){
            [s appendFormat:@"%@",[self substringWithRange:NSMakeRange(i,1)]];
        }else if(_char >='a' && _char <= 'z'){
            [s appendFormat:@"%@",[self substringWithRange:NSMakeRange(i,1)]];
        }else if(_char >='A' && _char <= 'Z')
        {
            [s appendFormat:@"%@",[self substringWithRange:NSMakeRange(i,1)]];
        }else{
            [s appendFormat:@"\\u%x",[self characterAtIndex:i]];
        }
    }
    return s;
}

@end
