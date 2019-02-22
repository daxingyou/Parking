import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    Image, 
    ListView, 
    ScrollView,
    DeviceEventEmitter,
    RefreshControl,
} from 'react-native'

import MessageCell from './View/MessageCell'
import Toast from '../../component/Toast'
import api, { paramsFormatGET } from '../../common/api'
import { storage } from '../../common/storage'
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view'

type Props = {
}

type State = {
    dataList: Array<Object>,
    refreshing: boolean,
}

export default class MessageScene extends PureComponent<Props, State> {
    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: '消息',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize:16,
            alignSelf:'center',
        },    
    })

    constructor(props: Props) {
        super(props);
        this.state = {
            dataList: [],
            refreshState: RefreshState.Idle,
        }
    }

    didSelected = (info) => {
        let newInfo = Object.assign({paymentType:1},info)
        console.log(JSON.stringify(newInfo))
        this.props.navigation.navigate('PaymentActionScene',{info:newInfo})
    }

    componentDidMount(){
        this.loginEmitter = DeviceEventEmitter.addListener('LOGIN_NOTIFICATION',_ => this.requestData())
        this.logoutEmitter = DeviceEventEmitter.addListener('LOGOUT_NOTIFICATION',() => {
            this.setState(
                {
                    dataList: [],
                    refreshState: RefreshState.Idle,
                }
            )
        })
        this.requestData()
        storage.load('loginInfo', (data) => {
            if (data.notFound) {
                this.props.navigation.navigate('LoginScene')
            }
        })

        /** 定时刷新页面 */
        // this.timerInterval = setInterval(() => {
        //     console.log('刷新消息页面')
            // storage.load('loginInfo', (data) => {
            //     if (!data.notFound) {
            //         this.requestData()
            //     }
            // })
        // }, 4000);
    }

    componentWillUnmount(){
        this.loginEmitter.remove()
        this.logoutEmitter.remove()
        // clearInterval(this.timerInterval)
    }
    pageNumber = 1;
    requestData =  async () => {
        try {
            let params = {
                page: this.pageNumber,
                page_size: 10,
            }
            let url = paramsFormatGET(api.GET_MESSAGE_API,params)
            console.log('消息列表请求接口:' + JSON.stringify(params));
            let response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let json = await response.json()
            let dataList = json.results;
            // console.log('消息列表:' + JSON.stringify(dataList));
            switch (response.status) {
                case 200:
                {
                    if (this.pageNumber==1) {
                        this.setState(
                            {
                                dataList: [],
                            }
                        )
                    }
                    if (dataList.length==0&&this.pageNumber>1) {
                        setTimeout(() => {
                            this.setState({refreshState: RefreshState.NoMoreData})
                        }, 500);
                    }
                    this.pageNumber++;
                    if (this.state.dataList.length>0) {
                        this.setState(
                            {
                                dataList: [...this.state.dataList, ...dataList],
                            }
                        )
                        console.log('数据源数据长度：' + this.state.dataList.length);
                    }else {
                        this.setState(
                            {
                                dataList: dataList,
                            }
                        )
                    }
                    setTimeout(() => {
                        this.setState(
                            {
                                refreshState: RefreshState.Idle
                            }
                        )
                    }, 300);
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
                    this.setState({refreshState: RefreshState.Failure})
                    Toast.show('未知系统错误')
                }
                    break;
            }
        } catch (error) {
            console.log(error)
            setTimeout(() => {
                this.setState({refreshState: RefreshState.Failure})
            }, 500);
        }
    }

    keyExtractor = (item: Object, index: number) => {
        return item.id.toString()
    }

    renderCell = (info: Object) => {
        return (
            <MessageCell
                info={info.item}
                onPress={(this.didSelected)}
            />
        )
    }

    onHeaderRefresh = () => {
        this.setState(
            {
                refreshState: RefreshState.HeaderRefreshing,
            }
        )
        this.pageNumber = 1;
        console.log('刷新消息列表');
        this.requestData();
    }

    onFooterRefresh = () => {
        if (this.state.refreshState==RefreshState.NoMoreData) {
            return;
        }
        console.log('加载中==>onFooterRefresh');
        this.setState({ refreshState: RefreshState.FooterRefreshing })
        this.requestData();
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
                    onFooterRefresh={this.onFooterRefresh}
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
