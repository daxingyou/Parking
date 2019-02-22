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
    TouchableHighlight
    } from 'react-native'
import DeviceInfo from 'react-native-device-info'

import { color } from '../../widget'
import api from '../../common/api'
import Toast from '../../component/Toast'
import { storage } from '../../common/storage'

type Props = {

}

type State = {
    appVersion: String,
}


export default  class AppInfoScene extends PureComponent<Props, State> {
    static navigationOptions = ({navigation}: any) => ({
        title: '关于',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize:16
        },  
    })

    constructor(props: Object) {
        super(props)
        this.state = {
            appVersion: "",
        }
    }

    componentDidMount = () => {
        let v = DeviceInfo.getVersion();
        this.setState({
            appVersion: v,
        })
        console.log("获取APP版本号为：" + v)
    }

    render = () => {
        return (
            <View style={styles.container}>
                <View style={styles.row}><Text style={{fontSize: 25}}>白银社区智慧停车场</Text></View>
                <View style={styles.row}>
                <Text style={{fontSize: 12,marginTop: 20}}>当前版本号</Text>
                <Text style={{fontSize: 12,marginTop: 20,color: color.primary}}>{'V' + this.state.appVersion}</Text>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        top: 150,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

