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
    DeviceEventEmitter,
    NativeModules,
    RefreshControl
    } from 'react-native'
import RefreshListView, {RefreshState} from 'react-native-refresh-list-view'
import BookigCell from './View/BookingCell'
import api, { paramsFormatGET } from '../../common/api'
import Toast from '../../component/Toast'
import { storage } from '../../common/storage'

type Props = {
    types: Array<string>,
    navigation: any,
}

type State = {
    typeIndex: number,
    dataList: Array<Object>,
    refreshing: boolean,
}

export default class HomeBookingScene extends PureComponent<Props, State> {

    constructor(props: Object) {
        super(props)
        this.state = {
            typeIndex: 0,
            dataList: [],
            refreshing: false,
            pageNum: 1,
        }
    }

    componentDidMount = () => {
        this.loginEmitter = DeviceEventEmitter.addListener('LOGIN_NOTIFICATION',_ => this.requestData())
        this.logoutEmitter = DeviceEventEmitter.addListener('LOGOUT_NOTIFICATION',() => {
            this.setState(
                {
                    dataList: [],
                    refreshing: false,
                }
            )
        })
        storage.load('loginInfo', (data) => {
            console.log('loginInfo' + data)
            if (data.notFound) {
                this.props.navigation.navigate('LoginScene')
            }else {
                this.requestData()
            }
        })
    }

    componentWillUnmount(){
        this.loginEmitter.remove()
        this.logoutEmitter.remove()
    }
    
    requestData =  async () => {
        this.setState({refreshing: true})
        try {
            let url = paramsFormatGET(api.GET_PARKING_INFO,{'format':'json'})
            let response = await fetch(url,
                {method:'GET'}
                )
            let dataList = await response.json()
            console.log('GET_PARKING_INFO:' + JSON.stringify(dataList));
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
                    storage.remove('loginInfo')
                    this.props.navigation.navigate('LoginScene')
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

    bookingAction = (info) => {
        Alert.alert('预约车位',('当前停车场还有'+info.residue_space_count+'个空余车位，是否预约？'), [
            {text:"取消",},
            {text:"确定", onPress:()=>{
                Alert.alert(info.name + '预约成功')
            }},
        ])
    }

    bookingConfirm = async (info) => {
        let params = {
            park: info.id,
        }
        try {
            let response = await fetch(api.ADD_GET_BOOKING_INFO,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            })
            let data = await response.json()
            console.log('停车场列表:' + JSON.stringify(data));
            switch (response.status) {
                case 201:
                {
                    Alert.alert(data.park_name + '预约成功')
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
                    DeviceEventEmitter.emit('CLEAR_LOGINFO__NOTIFICATION')
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

    pushParkingInfoPage = (info: Object) => {
        this.props.navigation.navigate('ParkingInfoScene',{info:info})
    }

    onHeaderRefresh= () => {
        console.log('下拉刷新');
        this.requestData();
    }

    renderCell = (info: Object) => {
        return (
            <BookigCell
                info={info.item}
                available={true}
                bookingAction={()=> {
                    Alert.alert('预约车位',('当前停车场还有'+info.item.residue_space_count+'个空余车位，是否预约？'), [
                        {text:"取消",},
                        {text:"确定", onPress:()=>this.bookingConfirm(info.item)},
                    ])
                }}
                onPress={() => this.pushParkingInfoPage(info.item)}
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
