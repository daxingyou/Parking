import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {screen} from '../../../common'
import color from '../../../widget/color'
import {Title, Paragraph} from '../../../widget/customText'

type Props = {
    info: Object,
    onPress: Function,
}

export default class BookingRecordCell extends PureComponent<props> {
    render() {
        let {info} = this.props
        return (
            <TouchableOpacity onPress={_ => this.props.onPress()} style={styles.container}>
            <View style={styles.leftContainer}>
                <Title numberOfLines={1}>{info.park_name}</Title>
                <Title style={{marginTop: 5}}>{info.status_str}</Title>
            </View>
            <Text style={styles.price}>{info.update_time}</Text>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    price: {
        marginRight: 0,
        alignItems: 'flex-end',
        color: color.gray,
    }
})