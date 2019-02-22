
const API_HOST = "http://by.ilinkin.com.cn";

export default {

    /** 首页停车场列表 */
    GET_PARKING_INFO: API_HOST + '/v1/park/',
    /** 新增用户预约信息(获取用户预约信息)*/
    ADD_GET_BOOKING_INFO: API_HOST + '/v1/reservation/',
    /** 获取手机验证码 */
    GET_CAPTCHA_API: API_HOST + '/v1/phone-verify/',
    /** 缴费记录(发起支付请求，获取订单) */
    PAYMENT_API: API_HOST + '/v1/pay/',
    /** 获取消息 */
    GET_MESSAGE_API: API_HOST + '/v1/message/',
    /** 登录 */
    LOGIN_API: API_HOST + '/v1/login/',
    /** 退出登录 */
    LOGOUT_API: API_HOST + '/v1/logout/',
    /** 获取(更新)用户信息 */
    GET_UPDATE_USER_INFO_API: API_HOST + '/v1/user-info/',
    /** 车牌信息(增加车牌信息) */
    PLATE_API: API_HOST + '/v1/plate/',
    /** 待支付列表 */
    UNPAID_LIST_API: API_HOST + '/v1/payable/',
    /** 版本更新 */
    APP_UPDATE_API: API_HOST + '/v1/app-version/',
    /** 最⼤大预约⻋车位保留留时 间(分钟) */
    MAX_RETENTION_TIME: API_HOST + '/v1/max-retention-time/',
}

/** 更新用户信息 */
export function modfiyUserInfo_api(id: string) {
    return GET_USER_INFO_API + '/' + id +'/'
}

/** 修改(删除)车牌信息 */
export function modifyPlateInfo_api(id: string) {
    return PLATE_API + '/' + id + '/'
}

/** 获取停车场详情信息 */
export function getParkingDetailInfo_api(id: string) {
    return GET_PARKING_INFO + '/' + id + '/'
}

/** 获取用户预约信息详情(用户取消预约)  */
export function getUserBookingDetailInfo_api(id: string) {
    return GET_BOOKING_INFO + '/' + id + '/'
}

export function paramsFormatGET(url,params) {
    let paramsArray = [];
    //拼接参数  
    Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))  
    if (url.search(/\?/) === -1) {  
        url += '?' + paramsArray.join('&')  
    } else {
        url += '&' + paramsArray.join('&')  
    } 
    return url;
}