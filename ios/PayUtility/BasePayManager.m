//
//  BasePayManager.m
//  LittleBee
//
//  Created by wulingiOS on 16/11/15.
//  Copyright © 2016年 weyao. All rights reserved.
//

#import "BasePayManager.h"
#import "NSString+EncodingUTF8Additions.h"

@implementation BasePayManager

- (void)sendPayWithUrl:(NSString *)url
           payCallback:(PayCallback)payCallback {
    //虚实现
}

- (NSString *)getOutTradeNo:(NSString *)url {
    NSString *urlStr = [url URLDecodingUTF8String];
    NSArray *parameterArray = [urlStr componentsSeparatedByString:@"&"];
    
    for (NSString *parameterStr in parameterArray) {
        NSArray *paramItem = [parameterStr componentsSeparatedByString:@"="];
        if (paramItem.count == 2 && [paramItem[0] isEqualToString:@"biz_content"]) {
            NSDictionary *biz_content = [DataUtils jsonStringTOdata:paramItem[1]];
            if (biz_content[@"out_trade_no"] != nil) {
                return biz_content[@"out_trade_no"];
            }
        }
    }
    
    return nil;
}

//支付返回结果，实际支付结果需要去微信服务器端查询
- (void)paySuccess {
    [self payCallback:kSuccess];
}

- (void)payFail {
    
    UIAlertView* alipay_alert = [[UIAlertView alloc] initWithTitle:self.payModelName
                                                           message:@"支付失败"
                                                          delegate:self
                                                 cancelButtonTitle:@"确定"
                                                 otherButtonTitles:nil, nil];
    alipay_alert.tag = kFail;
    [alipay_alert show];
}

- (void)payCancel {
    
    UIAlertView* alipay_alert = [[UIAlertView alloc] initWithTitle:self.payModelName
                                                           message:@"支付已取消"
                                                          delegate:self
                                                 cancelButtonTitle:@"确定"
                                                 otherButtonTitles:nil, nil];
    alipay_alert.tag = kCancel;
    [alipay_alert show];
}

- (void)payNetworkWrong {
    
    UIAlertView* alipay_alert = [[UIAlertView alloc] initWithTitle:self.payModelName
                                                           message:@"网络连接出错,请检查网络后再试"
                                                          delegate:self
                                                 cancelButtonTitle:@"确定"
                                                 otherButtonTitles:nil, nil];
    alipay_alert.tag = kNetworkWrong;
    [alipay_alert show];
}

- (void)payProcess {
    UIAlertView* alipay_alert = [[UIAlertView alloc] initWithTitle:self.payModelName
                                                           message:@"支付处理中..."
                                                          delegate:self
                                                 cancelButtonTitle:@"确定"
                                                 otherButtonTitles:nil, nil];
    alipay_alert.tag = kProcessing;
    [alipay_alert show];
}

- (void)payCallback:(EPayCallbackType)callbackType {
    if (self.payCallback != nil) {
        self.payCallback(callbackType, self.out_trade_no);
    }
}

@end
