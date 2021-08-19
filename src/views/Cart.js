import React, { useEffect, useState, Component } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { useDispatch, useSelector, connect } from "react-redux";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  View,
  Text,
  NativeEventEmitter,
  NativeModules,
  Alert,
  Platform,
  ToastAndroid
} from "react-native";

import { getGroceryItem } from "../services";
import {
  addToCart,
  clearFromCart,
  removeFromCart,
} from "../store/actions/grocery";
import { CartCard, EmptyState } from "../components";

class Cart extends Component {
  state = {
    items: []
  }

  dpayEvent = null;

  componentDidMount() {
    this.startup()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cart !== this.props.cart) {
      this.startup()
    }
  }

  componentWillUnmount() {
    this.cleanup()
  }

  startup = async () => {
    const { cart } = this.props;

    const keys = Object.keys(cart).filter((key) => !!cart[key]);
    const promises = keys.map((id) => getGroceryItem(id));
    const data = (await Promise.all(promises)).map((d) => d.data);

    this.setState({ items: data });

    this.cleanup()

    this.dpayEvent = new NativeEventEmitter(NativeModules.DpaySdk);
    this.dpayEvent.addListener('DpaySuccess', data => {
      this.success(data);
    });
    this.dpayEvent.addListener('DpayFailure', data => {
      this.failed(data);
    });
    this.dpayEvent.addListener('DpayClose', data => {
      this.close(data);
    });
  }

  cleanup = () => {
    if (this.dpayEvent) {
      this.dpayEvent.removeListener('DpaySuccess', this.success);
      this.dpayEvent.removeListener('DpayFailure', this.failed);
      this.dpayEvent.removeListener('DpayClose', this.close);
      this.dpayEvent = null;
    }
  }

  handleUpdate = ({ type, item }) => {
    if (type === "PLUS") {
      this.props.addToCart(item);
    } else if (type === "MINUS") {
      this.props.removeFromCart(item);
    } else if (type === "DELETE") {
      this.props.clearFromCart(item);
    }
  };

  getOrderDetails = async () => {
    try {
      const customer = { email: 'jude_casper@koss.info' };
      const response = await fetch('https://localhost:4001/orders', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: '10001',
          currency: 'IDR',
          order_ref_id: 'ord_key_001',
          customer: customer,
        }),
      });
      const json = await response.json();
      console.log('json', json);
      return json.data;
    } catch (error) {
      console.error(error);
    }
  };

  success = data => {
    console.log(data);
    if (Platform.OS == 'ios') Alert.alert(data);
    if (Platform.OS == 'android')
      ToastAndroid.showWithGravityAndOffset(
        data,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
  };

  failed = data => {
    console.log(data);
    if (Platform.OS == 'ios') Alert.alert(data);
    if (Platform.OS == 'android')
      ToastAndroid.showWithGravityAndOffset(
        data,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
  };

  close = data => {
    console.log(data);
    if (Platform.OS == 'ios') Alert.alert(data);
    if (Platform.OS == 'android')
      ToastAndroid.showWithGravityAndOffset(
        data,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
  };

  openCheckoutPage = async () => {
    const { DpaySdk } = NativeModules;
    console.log('open checkout');
    var ordersJson = await this.getOrderDetails();
    var checkoutOptions = {
      environment: 'production',
      locale: 'en',
      site_name: 'Movie Ticket',
      customer_id: 'cust_react_001',
      amount: '15000',
      currency: 'IDR',
      customer_email: 'joe@reactnative.com',
      order_id: ordersJson.id,
      access_token: ordersJson.access_token,
    };

    // console.log("native modules", "to call checkout");
    DpaySdk.openCheckout(checkoutOptions);
  };

  render() {
    const windowHeight = Dimensions.get("window").height;

    const { cart } = this.props;

    const { items } = this.state;
    const total = items.reduce((a, b) => a + cart[b.id] * b.price, 0);


    return (
      <View style={{ ...styles.container, minHeight: windowHeight }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <FontAwesome5
              style={{ margin: 12 }}
              name="chevron-left"
              color="#424242"
              size={24}
            />
          </TouchableOpacity>
          <Text style={styles.heading}>Cart</Text>
          <View style={{ width: 45 }}></View>
        </View>
        <ScrollView>
          {items.length ? (
            <View style={{ marginTop: 8, paddingBottom: 96 }}>
              {items.map((item) => (
                <CartCard
                  data={item}
                  cart={cart}
                  key={item.id}
                  navigation={this.props.navigation}
                  onUpdate={this.handleUpdate}
                ></CartCard>
              ))}
              <View
                style={{
                  padding: 16,
                  paddingVertical: 24,
                  minWidth: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    color: "#424242",
                    fontFamily: "Montserrat-Regular",
                  }}
                >
                  Total
                </Text>
                <View style={{ flexDirection: "row", alignContent: "center" }}>
                  <FontAwesome5
                    size={20}
                    color="#424242"
                    name="rupee-sign"
                    style={{ paddingTop: 7, paddingRight: 2 }}
                  />
                  <Text
                    style={{
                      fontSize: 24,
                      color: "#424242",
                      fontFamily: "Montserrat-SemiBold",
                    }}
                  >
                    {total}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={this.openCheckoutPage}
                style={{
                  backgroundColor: "#655DB0",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: "#FFFFFF",
                    textAlign: "center",
                    fontFamily: "Montserrat-SemiBold",
                  }}
                >
                  PLACE ORDER
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <EmptyState
              type="cart"
              message="No Items in cart"
              description="When you are ready, go ahead and add some"
            />
          )}
        </ScrollView>
      </View>
    );
  }
}


Cart.sharedElements = (route) => {
  const {
    item: { cart },
  } = route.params;
  return [
    ...Object.keys(cart)
      .filter((key) => !!cart[key])
      .map((c) => `item.${c}.photo`),
  ];
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F2F2F2",
  },
  topBar: {
    minWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 24,
    color: "#424242",
    textAlign: "center",
    fontFamily: "Montserrat-SemiBold",
  },
});


const mapStateToProps = ({ groceryState }) => ({
  cart: groceryState.cart
})

const mapDispatchToProps = {
  addToCart,
  removeFromCart,
  clearFromCart,
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
