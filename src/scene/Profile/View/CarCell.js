import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image
} from 'react-native'
import { color } from '../../../widget'
import { screen } from '../../../common'
import { Title, Paragraph } from '../../../widget/customText'

type Props = {
    info: Object,
    onPress: Function,
    available: boolean,
    canSelected: boolean,
}


export default class CarCell extends PureComponent<Props> {
    render() {
        let {info,canSelected} = this.props
        if (canSelected) {
            return (
                <View>
                <TouchableOpacity style={styles.container} onPress={() => this.props.onPress(info)}>
                    <Title numberOfLines={1} style={{marginLeft: 15}}>{info.plate}</Title>
                    <Paragraph numberOfLines={1} style={{marginRight: 15}}>{info.remark}</Paragraph>
                </TouchableOpacity>
                </View>
            )
        }else {
            return (
                <View style={styles.container}>
                    <Title numberOfLines={1} style={{marginLeft: 15}}>{info.plate}</Title>
                    <Paragraph numberOfLines={1} style={{marginRight: 15}}>{info.remark}</Paragraph>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems:'center',
    },
    bookingAvailable: {
        fontSize: 10,
        color: color.primary,
        marginTop: 5,
    },
    bookingUnavailable: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
    }
})