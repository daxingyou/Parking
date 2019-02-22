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
import BookingRecordCell from './View/BookingRecordCell'
import { NavigationItem } from '../../widget' 
import api, { paramsFormatGET } from '../../common/api'
import Toast from '../../component/Toast'

type Props = {
    types: Array<string>,
    navigation: any,
}

type State = {
    dataList: Array<Object>,
    refreshing: boolean,
}

const kPageNumber = 1;
const kPageSize = 20

export default class MyBookingScene extends PureComponent<Props, State> {
    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: '预约记录',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize:16
        },    
    })

    constructor(props: Props) {
        super(props);
        this.state = {
            dataList: [],
            refreshState: false,
        }
    }

    componentDidMount = () => {
      this.requestData()
      this.bookingListEmitter = DeviceEventEmitter.addListener('REFRESH_BOOKINGLIST_NOTIFICATION',_ => this.requestData())
    }

    componentWillUnmount(){
        this.bookingListEmitter.remove()
    }
    
    requestData =  async () => {
        this.setState({refreshing: true})
        try {
            let params = {
                page: 1,
                page_size: 20,
            }
            let url = paramsFormatGET(api.ADD_GET_BOOKING_INFO,params)
            let response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let json = await response.json()
            let dataList = json.results;
            console.log('ADD_GET_BOOKING_INFO:' + JSON.stringify(dataList));
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

    pushBookingDetailPage = (info: Object) => {
        this.props.navigation.navigate('MyBookingDetailScene',{info:info})
    }

    renderCell = (info: Object) => {
        return (
            <BookingRecordCell
                info = {info.item}
                onPress={() => this.pushBookingDetailPage(info.item)}
            />
        )
    }

    keyExtractor = (item: Object, index: number) => {
        return item.id.toString()
    }

    render = () => {
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.dataList}
                    renderItem={this.renderCell}
                    refreshing={this.state.refreshing}
                    keyExtractor={this.keyExtractor}
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