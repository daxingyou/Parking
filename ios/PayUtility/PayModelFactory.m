//
//  PayModelFactory.m
//  LittleBee
//
//  Created by wulingiOS on 16/11/15.
//  Copyright © 2016年 weyao. All rights reserved.
//

#import "PayModelFactory.h"

@implementation PayModelFactory

+ (BasePayManager <PayProtocol>*)payModelFactoryWqWithPayType:(EPayType)payType {
    
    BasePayManager <PayProtocol> *paymodel = nil;
    
    if (payType == kPayTypeAlipay) {
        paymodel = [AlipayManager sharedManager];
    } else if (payType == kPayTypeWechatPay) {
        
        paymodel = [WechatPayManager sharedManager];
    }
    
    return paymodel;
}

@end
