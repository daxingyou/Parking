import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ListView, 
    Image, 
    StatusBar,
    Button,
    Alert,
    NativeModules,
    Picker,
    DeviceEventEmitter,
    Modal
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import ModalDropdown from 'react-native-modal-dropdown'
import {color, SpacingView, PKButton } from '../../widget'
import { screen, system } from '../../common'
import { Title, Paragraph, Tip, Heading2 } from '../../widget/customText'
import Toast from '../../component/Toast'
import ActionSheet from 'react-native-actionsheet'
import api, { paramsFormatGET } from '../../common/api'

type Props = {
    types: Array<string>,
    navigation: any,
    info: Object,
}

type State = {
    Info: Object,
    refreshing: boolean,
    payDescription: string,
    showPayDesc: boolean,
}

export default  class PaymentActionScene extends PureComponent<Props, State> {

    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: '缴费',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize: 16
        },
    })

    constructor(props: Props) {
        super(props)
        this.state = {
            showPayDesc: true,
            selectedPlate: Object,
            plateList: [],
            paymentInfo: Object,
            unpaidFlag: false,
            payShow: false,
        }
    }

    componentDidMount = () => {
        this.getPaymentInfoData()
    }

    getPaymentInfoData = async () => {
        let info = this.props.navigation.state.params.info;
        if (info.paymentType==1) {
            this.setState({paymentInfo:info,unpaidFlag:true})
        }else if (info.paymentType==2 || !info.paymentType) {
            try {
                let paymentInfoUrl =  api.PAYMENT_API + this.props.navigation.state.params.info.id.toString()  + '/'
                console.log('paymentInfoUrl：' + paymentInfoUrl)
                let response = await fetch(paymentInfoUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                let resData = await response.json()
                console.log('缴费记录:' + JSON.stringify(resData))
                switch (response.status) {
                    case 200:
                        {
                            this.setState({
                                paymentInfo: resData
                            })
                        }
                        break;
                    case 404: {
                        Toast.show('订单记录不存在')
                    }
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.log(error)
                this.setState({refreshing: false})
            }
        }
    }

    updatePayResult = () => {
        this.props.navigation.goBack()
        setTimeout(() => {
            DeviceEventEmitter.emit('PAY_SUCCESS_RESULT_NOTIFICATION')
        }, 300);
    }

    sendPayRequestAction = async (payType) => {
        let payOrderParams = {
            pay_platform: payType,//1：支付宝，2：微信
            plate: this.state.paymentInfo.plate,//车牌号id
        }
        console.log('支付订单参数：' + JSON.stringify(payOrderParams))
        try {
            let response = await fetch(api.PAYMENT_API,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payOrderParams),
            })
            let data = await response.json()
            console.log('PAYMENT_API:' + JSON.stringify(data));
            switch (response.status) {
                case 200:
                {
                    if (system.isIOS) {
                        let payOptions = {};
                        if (payType==1) {
                            payOptions = {
                                payType: payType,
                                url: data.order_string,
                            }
                        }
                        if (payType ==2) {
                            payOptions = {
                                payType: payType,
                                url: JSON.stringify(data.order_raw),
                            }
                        }
                        this.revokeNativePayMethod(payOptions)
                    }else {
                        let ParkingEventManager = NativeModules.ParkingEventManager
                        if (payType==1) {
                            ParkingEventManager.sendAliPayRequest(data.order_string)
                        }
                        if (payType ==2) {
                            let jsonString = JSON.stringify(data.order_raw)
                            ParkingEventManager.sendWXPayRequest(jsonString)
                        }
                    }
                    setTimeout(() => {
                        Alert.alert('是否支付完成？',(''), [
                            {text:"否",},
                            {text:"是", onPress:_ => this.updatePayResult()},
                        ])
                    }, 3000);
                }
                    break;
                case 400:
                {
                    Toast.show('提交数据有误')
                }
                    break;
                case 403:
                {
                    Toast.show('未登录')
                }
                    break;
                case 404:
                {
                    Toast.show('未找到入场记录，请确认车辆是否在停车场内')
                }
                    break;
                default: 
                {
                    Toast.show('未知系统错误')
                }
                    break;
            }
        } catch (error) {
            console.log(error)
            this.setState({refreshing: false})
        }
    }


    onButtonPress = () => {
        let isShow = this.state.payShow;
        this.setState({
            payShow: !isShow,
        });
    }

    goPay(payType) {
        this.sendPayRequestAction(payType);
        this.onButtonPress();
    }
    revokeNativePayMethod = (payOptions) => {
        let ParkingEventManager = NativeModules.ParkingEventManager
        ParkingEventManager.sendPayRequest(payOptions)
    }

    showDescription = () => {
        this.setState({showPayDesc:!this.state.showPayDesc})
    }

    renderPayButton = () => {
        return (
            <View style={styles.button}>
                <PKButton
                    onPress={(this.onButtonPress)}
                    title='支付'
                    titleStyle={{color: '#fff',fontSize: 16,}}
                />
            </View>
        )
    }

    render = () => {
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={true}>

                    <SpacingView/>

                    <View style={styles.headerContainer}>
                        <Heading2>付款金额</Heading2>
                        <Paragraph style={{fontWeight: 'bold',fontSize: 16}}>{'￥' + this.state.paymentInfo.total_amount}</Paragraph>
                    </View>

                    <SpacingView/>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}><Title>车牌</Title><Paragraph>{this.state.paymentInfo.plate_str}</Paragraph></View>
                        <View style={styles.infoRow}><Title>支付状态</Title><Paragraph>{this.state.unpaidFlag?'待支付':this.state.paymentInfo.status_str}</Paragraph></View>
                        <View style={styles.infoRow}><Title>入场时间</Title><Paragraph>{this.state.paymentInfo.car_in_time}</Paragraph></View>
                        <View style={styles.infoRow}><Title>算费截止时间</Title><Paragraph>{this.state.paymentInfo.get_times}</Paragraph></View>
                    </View>

                    <SpacingView/>
                    
                    <TouchableOpacity onPress={this.showDescription}>
                        <View style={styles.descHeader}>
                            <Title>缴费说明</Title>
                            <Icon name={this.state.showPayDesc?'angle-up':'angle-down'} size={25} color={color.primary} />
                        </View>
                    </TouchableOpacity>
                    
                    {this.state.showPayDesc ? 
                    (
                    <View style={styles.descContainer}>
                    <Tip style={{fontSize: 11}}>{this.state.paymentInfo.payment_instruction}</Tip>
                    </View>
                    ):null}

                    <SpacingView/>

                    {(this.state.paymentInfo.paymentType==1)?this.renderPayButton():null}

                </ScrollView>
                <Modal
                    animationType='fade'
                    transparent={true}
                    visible={this.state.payShow}
                    onShow={() => {}}
                    onRequestClose={() => {}} 
                >
                    <View style={styles.payModalContainer}>
                        <View style={styles.actionSheet}>
                            <View style={styles.payHeader}>
                                <Text style={styles.payTitle}>选择支付方式</Text>
                            </View>
                            <View style={styles.payBody}>
                                <TouchableOpacity onPress={() => this.goPay(1)} style={styles.payItem}>
                                    <Image source={require('../../img/alipay.png')} style={{width: 50, height: 50}}></Image>
                                    <Text> 支付宝</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.goPay(2)} style={styles.payItem}>
                                    <Image source={require('../../img/wechat.png')} style={{width: 50, height: 50}}></Image>
                                    <Text>微信支付</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.payFooter} onPress={() => this.onButtonPress()}>
                                <Text style={styles.cancel}>取  消</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    infoContainer: {
        padding: 15,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 5,
    },
    plateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    descHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    descContainer: {
        padding: 15,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    button: {
        width: screen.width - 100,
        height: 44,
        marginTop: 35,
        marginLeft: 50,
        marginBottom: 35,
        backgroundColor: color.primary,
        borderRadius: 5,
        justifyContent: 'center',
    },
    payModalContainer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        width: screen.width,
        height: screen.height,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    actionSheet: {
        width: screen.width,
        backgroundColor: 'white',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    payHeader: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    payTitle: {
        fontSize: 16,
        color: '#4A4A4A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payBody: {
        width: screen.width,
        paddingTop: 30,
        paddingRight: screen.width*0.22,
        paddingBottom: 40,
        paddingLeft: screen.width*0.22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    payItem: {

    },
    payFooter: {
        flexDirection: 'column',
        width: screen.width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#F5F5F5',
    },
    cancel: {
        color: color.primary,
        fontSize: 16,
    }
})
