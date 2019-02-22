package com.ilinkin.parking.service;


import android.app.Activity;
import android.widget.Toast;

import com.jpay.JPay;

public class IPayLogic {
    private static IPayLogic mIPayLogic;
    private Activity mContext;

    private IPayLogic(Activity context) {
        mContext = context;
    }

    public static IPayLogic getIntance(Activity context) {
        if (mIPayLogic == null) {
            synchronized (IPayLogic.class) {
                if (mIPayLogic == null) {
                    mIPayLogic = new IPayLogic(context);
                }
            }
        }
        return mIPayLogic;
    }

    public void startAliPay(final String orderInfo) {
        JPay.getIntance(mContext).toPay(JPay.PayMode.ALIPAY, orderInfo, new JPay.JPayListener() {
            @Override
            public void onPaySuccess() {
                Toast.makeText(mContext, "支付成功", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onPayError(int error_code, String message) {
                Toast.makeText(mContext, "支付失败>" + error_code + " " + message, Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onPayCancel() {
                Toast.makeText(mContext, "取消了支付", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onUUPay(String dataOrg, String sign, String mode) {

            }
        });
    }


    /**
     * 调起支付
     *
     * @param appId
     * @param partnerId
     * @param prepayId
     * @param nonceStr
     * @param timeStamp
     * @param sign
     */
    public void startWXPay(String appId, String partnerId, String prepayId,
                           String nonceStr, String timeStamp, String sign) {

        JPay.getIntance(mContext).toWxPay(appId, partnerId, prepayId, nonceStr, timeStamp, sign, new JPay.JPayListener() {
            @Override
            public void onPaySuccess() {
                Toast.makeText(mContext, "支付成功", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onPayError(int error_code, String message) {
                Toast.makeText(mContext, "支付失败>" + error_code + " " + message, Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onPayCancel() {
                Toast.makeText(mContext, "取消了支付", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onUUPay(String dataOrg, String sign, String mode) {

            }
        });
    }
}
