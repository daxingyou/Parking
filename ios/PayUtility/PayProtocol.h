//
//  PayProtocol.h
//  LittleBee
//
//  Created by wulingiOS on 16/11/15.
//  Copyright © 2016年 weyao. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PayResultProcess.h"

typedef NS_ENUM(NSInteger, EPayCallbackType) {
    kSuccess         = 1001,
    kFail            = 1002,
    kCancel          = 1003,
    kNetworkWrong    = 1004,
    kProcessing      = 1005,
};

typedef void (^PayCallback)(EPayCallbackType callbackType, NSString *out_trade_no);

@protocol PayProtocol <NSObject>

- (void)sendPayWithUrl:(NSString *)url
           payCallback:(PayCallback)payCallback;

@end
