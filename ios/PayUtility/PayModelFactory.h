//
//  PayModelFactory.h
//  LittleBee
//
//  Created by wulingiOS on 16/11/15.
//  Copyright © 2016年 weyao. All rights reserved.
//

#import "BasePayManager.h"
#import "AlipayManager.h"
#import "WechatPayManager.h"

typedef NS_ENUM(NSInteger, EPayType) {
    kPayTypeAlipay        = 1,
    kPayTypeWechatPay     = 2,
};

typedef NS_ENUM(NSInteger, EPayResultType) {
    kPayResultTypeSuccess        = 1,
    kPayResultTypeProcess        = 2,
    kPayResultTypeFail           = 3,
};

@interface PayModelFactory : NSObject

+ (BasePayManager <PayProtocol>*)payModelFactoryWqWithPayType:(EPayType)payType;

@end
