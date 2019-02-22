//
//  NSString+EncodingUTF8Additions.h
//  LittleBee
//
//  Created by wulingiOS on 16/11/14.
//  Copyright © 2016年 weyao. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSString (EncodingUTF8Additions)

- (NSString *)URLEncodingUTF8String;//编码
- (NSString *)URLDecodingUTF8String;//解码

- (NSString *)replaceUnicode;//unicode转utf8
- (NSString *)UnicodeString;//utf8转unicode

@end
