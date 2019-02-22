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
    FlatList,
    Alert,
    DeviceEventEmitter
    } from 'react-native'
import RefreshListView, {RefreshState} from 'react-native-refresh-list-view'
import PaymentRecordCell from './View/PaymentRecordCell'
import api, { paramsFormatGET } from '../../common/api'
import Toast from '../../component/Toast'
import { storage } from '../../common/storage'

type Props = {
    navigation: any,
}

type State = {
    dataList: Array<Object>,
    refreshing: boolean,
}

export default class HomePaymentScene extends PureComponent<Props, State>  {
    static navigationOptions = ({navigation}: any) => ({
        title: '缴费',
    })

    constructor(props: Object) {
        super(props)
        this.state = {
            dataList: [],
            refreshState: RefreshState.Idle,
        }
    }

    didSelected = (info: Object) => {
        this.props.navigation.navigate('PaymentActionScene',{info:info})
    }

    componentDidMount () {
        this.loginEmitter = DeviceEventEmitter.addListener('LOGIN_NOTIFICATION',_ => this.requestUnpaidData())
        this.payEmitter = DeviceEventEmitter.addListener('PAY_SUCCESS_RESULT_NOTIFICATION',_ => this.requestUnpaidData())
        this.bookingEmitter = DeviceEventEmitter.addListener('BOOKING_NOTIFICATION',_ => this.requestUnpaidData())
        this.logoutEmitter = DeviceEventEmitter.addListener('LOGOUT_NOTIFICATION',() => {
            this.setState(
                {
                    dataList: [],
                    refreshing: false,
                }
            )
        })
        /** 这个页面先加载待支付列表，如果待支付列表为空，再去加载缴费记录列表 */
        this.requestUnpaidData()
        /** 定时刷新页面 */
        // this.timerInterval = setInterval(() => {
        //     console.log('刷新待支付列表页面')
        //     storage.load('loginInfo', (data) => {
        //         if (!data.notFound) {
        //             this.requestUnpaidData()
        //         }
        //     })
        // }, 4000);
    }

    componentWillUnmount(){
        this.loginEmitter.remove()
        this.payEmitter.remove()
        this.bookingEmitter.remove()
        this.logoutEmitter.remove()
        // clearInterval(this.timerInterval)
    }

    requestUnpaidData = async () => {
        try {
            let params = {
                page: 1,
                page_size: 20,
            }
            let response = await fetch(api.UNPAID_LIST_API,{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let dataList = await response.json()
            console.log('待支付列表:'+ api.UNPAID_LIST_API + ':'+ JSON.stringify(dataList));
            switch (response.status) {
                case 200:
                {
                    if (dataList.length > 0) {
                        this.setState(
                            {
                                dataList: dataList,
                                refreshState: RefreshState.Idle,
                            }
                        )
                    }else {
                        this.requestPayRecordData()
                    }
                }
                    break;
                case 403:
                {
                    Toast.show('未登录')
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
            this.setState({refreshState: RefreshState.Failure})
        }
    }
    
    requestPayRecordData =  async () => {
        try {
            let params = {
                page: 1,
                page_size: 20,
            }
            let url = paramsFormatGET(api.PAYMENT_API,params)
            let response = await fetch(url,{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let json = await response.json()
            let dataList = json.results;
            console.log('缴费记录列表:'+ api.PAYMENT_API + ':'+ JSON.stringify(dataList));
            switch (response.status) {
                case 200:
                {
                    this.setState(
                        {
                            dataList: dataList,
                            refreshing: false,
                        }
                    )
                }
                    break;
                case 403:
                {
                    Toast.show('未登录')
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

    keyExtractor = (item: Object, index: number) => {
        let randomNum = Math.random()*1000000000
        return randomNum.toString()
    }

    onHeaderRefresh = () => {
        console.log('刷新待支付列表');
        this.requestUnpaidData();
    }
    
    renderCell = (info: Object) => {
        return (
            <PaymentRecordCell
                info={info.item}
                onPress={(this.didSelected)}
            />
        )
    }

    render = () => {
        return (
            <View style={styles.container}>
                <RefreshListView
                    data={(this.state.dataList)}
                    renderItem={(this.renderCell)}
                    keyExtractor={this.keyExtractor}
                    onEndReachedThreshold={-0.1}
                    refreshState={this.state.refreshState}
                    onHeaderRefresh={this.onHeaderRefresh}
                />
            </View>        
        )
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})