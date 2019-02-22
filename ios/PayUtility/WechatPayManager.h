//
//  WeixinPay.h
//  LittleBee
//
//  Created by diaolong on 15/9/9.
//
//
#import "WXApi.h"
#import "WXApiObject.h"
#import <Foundation/Foundation.h>
#import "BasePayManager.h"

@interface WechatPayManager : BasePayManager <WXApiDelegate>

+ (WechatPayManager *)sharedManager;


@end
