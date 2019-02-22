package com.ilinkin.parking.communication;

import com.alibaba.sdk.android.push.noonesdk.PushServiceFactory;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

//import android.content.Intent;
//import android.net.Uri;
//import android.util.Log;

import com.facebook.react.bridge.Callback;
//import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
//import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.ilinkin.parking.service.IPayLogic;

import com.alibaba.sdk.android.push.CloudPushService;

import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

public class CommModule extends ReactContextBaseJavaModule {

    private ReactApplicationContext mContext;
    public static final String MODULE_NAME = "ParkingEventManager";
//    public static final String EVENT_NAME = "nativeCallRn";
    /**
     * 构造方法必须实现
     * @param reactContext
     */
    public CommModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mContext = reactContext;
    }

    /**
     * 在rn代码里面是需要这个名字来调用该类的方法
     * @return
     */
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * RN调用Native的方法 调起支付
     */
    @ReactMethod
    public void sendAliPayRequest(String payOptions) {
//        Toast.makeText(this.mContext, payOptions,Toast.LENGTH_LONG);
        IPayLogic.getIntance(mContext.getCurrentActivity()).startAliPay(payOptions);
    }

    /**
     * RN调用Native的方法 调起微信支付宝支付
     */
    @ReactMethod
    public void sendWXPayRequest(String payOptions) {
//        Toast.makeText(this.mContext, payOptions,Toast.LENGTH_SHORT);
        try {
            JSONObject payObject = new JSONObject(payOptions);
            String appId = payObject.getString("appid");
            String partnerId = payObject.getString("partnerid");
            String prepayId = payObject.getString("prepayid");
            String nonceStr = payObject.getString("noncestr");
            String timeStamp = payObject.getString("timestamp");
            String sign = payObject.getString("sign");
            IPayLogic.getIntance(mContext.getCurrentActivity()).startWXPay(appId,partnerId,prepayId,nonceStr,timeStamp,sign);
        } catch (JSONException e) {

        }
    }

    /**
     * Native调用RN
     * @param msg
     */
//    public void nativeCallRn(String msg) {
//        mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                .emit(EVENT_NAME,msg);
//    }

    /**
     * rn调用Native 获取推送设备id
     */
    @ReactMethod
    public void getDevicePushClientId(Callback callback) {
        CloudPushService pushService = PushServiceFactory.getCloudPushService();
        String pushDeviceId = pushService.getDeviceId();
        callback.invoke(null,pushDeviceId);
    }

    /**
     * Promise
     * @param msg
     * @param promise
     */
//    @ReactMethod
//    public void rnCallNativeFromPromise(String msg, Promise promise) {
//
//        Log.e("---","adasdasda");
//        // 1.处理业务逻辑...
//        String result = "处理结果：" + msg;
//        // 2.回调RN,即将处理结果返回给RN
//        promise.resolve(result);
//    }

    /**
     * 向RN传递常量
     */
//    @Nullable
//    @Override
//    public Map<String, Object> getConstants() {
//        Map<String,Object> params = new HashMap<>();
//        params.put("Constant","我是常量，传递给RN");
//        return params;
//    }

}
