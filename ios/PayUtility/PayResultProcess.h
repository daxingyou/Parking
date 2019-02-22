//
//  PayResultProcess.h
//  LittleBee
//
//  Created by diaolong on 15/9/24.
//
//

#import <Foundation/Foundation.h>

@protocol PayResultProcess <NSObject>

@required
-(void)paySuccess:(NSString *)payNumberId;
-(void)payFail:(NSString *)payNumberId;
-(void)payCancel:(NSString *)payNumberId;

@optional
-(void)payProcessing:(NSString *)payNumberId;    //支付宝特有的处理  正在处理中
-(void)payNetworkWrong:(NSString *)payNumberId;  //支付宝特有的处理  网络连接出错

@end
