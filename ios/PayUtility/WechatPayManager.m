//
//  WeixinPay.m
//  LittleBee
//
//  Created by diaolong on 15/9/9.
//
//
#import "WechatPayManager.h"
#import "NSString+EncodingUTF8Additions.h"

#define WEIXIN_INSTALL_ALERT_TAG    100

#define PayModelName @"微信支付"
#define WechatShiBoAppKey @"wx26c6ddbe77ce035d"

@implementation WechatPayManager

+ (WechatPayManager *)sharedManager {
    
    static WechatPayManager *sharedManager = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        sharedManager = [[self alloc] init];
        sharedManager.payModelName = PayModelName;
        NSString *wechatAppId = WechatShiBoAppKey;
        NSLog(@"微信AppId: %@",wechatAppId);
        [WXApi registerApp:wechatAppId];
    });

    return sharedManager;
}

- (void)sendPayWithUrl:(NSString *)url
           payCallback:(PayCallback)payCallback {
  NSLog(@"微信支付参数: %@",url);
  UIAlertView *weixin_install_alert;
  if (![WXApi isWXAppInstalled]) {
      weixin_install_alert= [[UIAlertView alloc] initWithTitle:PayModelName
                                                       message:@"没有安装微信"
                                                      delegate:self
                                             cancelButtonTitle:@"确定"
                                             otherButtonTitles:@"安装微信", nil];
      weixin_install_alert.tag = WEIXIN_INSTALL_ALERT_TAG;
      [weixin_install_alert show];
      return;
  }
  
  if (![WXApi isWXAppSupportApi]) {
      weixin_install_alert = [[UIAlertView alloc] initWithTitle:PayModelName
                                                        message:@"此版本微信暂不支持支付"
                                                       delegate:self
                                              cancelButtonTitle:@"确定"
                                              otherButtonTitles:@"更新微信", nil];
      weixin_install_alert.tag = WEIXIN_INSTALL_ALERT_TAG;
      [weixin_install_alert show];
      return;
  }
  

  self.out_trade_no = [self getOutTradeNo:url];
  self.payCallback = payCallback;

  
  NSDictionary *payReqDic = [DataUtils jsonStringTOdata:url];
  PayReq *weixin_req =  [[PayReq alloc] init];
  weixin_req.openID    = payReqDic[@"appid"];
  weixin_req.partnerId = payReqDic[@"partnerid"];
  weixin_req.prepayId  = payReqDic[@"prepayid"];
  weixin_req.nonceStr  = payReqDic[@"noncestr"];
  weixin_req.timeStamp = [payReqDic[@"timestamp"] intValue];
  weixin_req.package   = payReqDic[@"package"];
  weixin_req.sign      = payReqDic[@"sign"];
  BOOL isSuccess = [WXApi sendReq:weixin_req];
  NSLog(@"%@",isSuccess?@"发起微信支付成功":@"发起微信支付失败");
}

#pragma mark - WXApiDelegate
- (void)onResp:(BaseResp*)resp {
    NSLog(@"微信支付回调Code: %d",resp.errCode);
    if([resp isKindOfClass:[PayResp class]]){
        PayResp *response = (PayResp*)resp;
        switch (response.errCode) {
            case WXSuccess:             [self paySuccess];  break;
            case WXErrCodeUserCancel:   [self payCancel];   break;
            default:                    [self payFail];     break;
        }
    }
    
}

#pragma mark - UIAlertViewDelegate
- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    
    if (alertView.tag == WEIXIN_INSTALL_ALERT_TAG) {
        if (buttonIndex != alertView.cancelButtonIndex) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[WXApi getWXAppInstallUrl]]]; //安装或更新 微信
        }else{
            [self payCallback:kCancel];
        }
    }else {
        [self payCallback:alertView.tag];
    }
}

@end
