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
    DeviceEventEmitter
    } from 'react-native'
import RefreshListView, {RefreshState} from 'react-native-refresh-list-view'
import PaymentRecordCell from '../Home/View/PaymentRecordCell'
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

export default class MyPaymentScene extends PureComponent<Props, State> {
    static navigationOptions = ({navigation}:any) => ({
        title: '缴费记录',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize:16
        },    
    })
    constructor(props: Object) {
        super(props)

        this.state = {
            dataList: [],
            refreshState: false,
        }
    }

    componentDidMount = () => {
      this.requestData()
    };
    
    requestData =  async () => {
        this.setState({refreshing: true})
        try {
            let params = {
                page: 1,
                page_size: 20,
            }
            let url = paramsFormatGET(api.PAYMENT_API,params)
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

    keyExtractor = (item: Object, index: number) => {
        return item.id.toString()
    }

    didSelected = (info: Object) => {
        this.props.navigation.navigate('PaymentActionScene',{info:info})
    }

    renderCell = (info: Object) => {
        return (
            <PaymentRecordCell
                info = {info.item}
                onPress= {(this.didSelected)}
            />
        )
    }

    render() {
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