//
//  BasePayManager.h
//  LittleBee
//
//  Created by wulingiOS on 16/11/15.
//  Copyright © 2016年 weyao. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PayProtocol.h"
#import "PayResultProcess.h"
#import "DataUtils.h"

@interface BasePayManager : NSObject <PayProtocol>

@property (nonatomic, strong) NSString       *out_trade_no;
@property (nonatomic, copy)   PayCallback    payCallback;
@property (nonatomic, strong) NSString       *payModelName;

- (NSString *)getOutTradeNo:(NSString *)url;

- (void)paySuccess;
- (void)payFail;
- (void)payCancel;
- (void)payNetworkWrong;
- (void)payProcess;

- (void)payCallback:(EPayCallbackType)callbackType;

@end
