
import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ViewPropTypes
    } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { screen } from '../../../common'
import { color, Separator } from '../../../widget'
import { Title, Paragraph, Heading3 } from '../../../widget/customText'

type Props = {
    image?: any,
    style?: ViewPropTypes.style,
    title: string,
    iconName?: string,
    onPress: Function,
    cellId?:any,
}

export default class ProfileCell extends PureComponent<Props> {
    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => this.props.onPress(this.props.cellId)}>
                    <View style={[styles.content, this.props.style]}>
                        <View style={styles.titleContainer}>
                            <Icon name={this.props.iconName} size={20} color={color.primary} />
                            <Heading3 style={{marginLeft: 10}}>{this.props.title}</Heading3>
                        </View>
                        <Icon style={styles.arrow} name='angle-right' size={20} color={color.primary} />
                    </View>
                    <Separator />
                </TouchableOpacity>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
    },
    content: {
        height: 50,
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems:'center',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    arrow: {
        justifyContent: 'flex-end',
        marginLeft: 5,
    }
})