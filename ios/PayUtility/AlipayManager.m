//
//  AlipayManager.m
//  LittleBee
//
//  Created by diaolong on 15/9/24.
//
//

#import "AlipayManager.h"

typedef enum AliPayResult {
    AliPayResultSuccess         = 9000,    // 订单支付成功
    AliPayResultProcessing      = 8000,    // 正在处理中
    AliPayResultPayFailed       = 4000,    // 订单支付失败
    AliPayResultUserCancel      = 6001,    // 用户中途取消
    AliPayResultNetworkWrong    = 6002     // 网络连接出错
} AliPayResult;

#define PayModelName @"支付宝支付"
#define AlipayScheme @"cn.com.ilinkin.by.alipay"

@implementation AlipayManager

+ (AlipayManager *)sharedManager {
    
    static AlipayManager *sharedManager = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        sharedManager = [[self alloc] init];
        sharedManager.payModelName = PayModelName;
    });
    
    return sharedManager;
}

- (void)sendPayWithUrl:(NSString *)url
           payCallback:(PayCallback)payCallback {
    NSLog(@"支付宝支付参数：%@",url);
    self.out_trade_no = [self getOutTradeNo:url];
    self.payCallback = payCallback;
    
    [[AlipaySDK defaultService] payOrder:url
                              fromScheme:AlipayScheme
                                callback:^(NSDictionary *resultDic) {
                                        [self processAlipayResult:resultDic];
    }];
}



-(void)processAlipayResult:(NSDictionary *)resultDic {
    NSLog(@"支付宝支付结果%@",resultDic);
    switch ([resultDic[@"resultStatus"] integerValue]) {
        case AliPayResultSuccess:       [self paySuccess];       break;
        case AliPayResultPayFailed:     [self payFail];          break;
        case AliPayResultUserCancel:    [self payCancel];        break;
        case AliPayResultNetworkWrong:  [self payNetworkWrong];  break;
        case AliPayResultProcessing:    [self payProcess];       break;
        default:break;
    }
}


#pragma mark - UIAlertViewDelegate
- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    [self payCallback:alertView.tag];
}


@end
