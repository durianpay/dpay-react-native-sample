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
  ToastAndroid,
  ActivityIndicator,
} from "react-native";

import { getGroceryItem } from "../services";
import {
  addToCart,
  clearFromCart,
  removeFromCart,
} from "../store/actions/grocery";
import { CartCard, EmptyState } from "../components";

import RNDpaySdk from "react-native-dpay-sdk";
import {
  CURRENCY,
  CUSTOMERADDRESSLINE1,
  CUSTOMERCITY,
  CUSTOMERCOUNTRY,
  CUSTOMERMOBILE,
  CUSTOMERPOSTALCODE,
  CUSTOMERREGION,
  CUSTOMER_EMAIL,
  CUSTOMER_REF_ID,
  ENVIRONMENT,
  LABEL,
  LANDMARK,
  LOCALE,
  MERCHANT_BACKEND_URL,
  ORDER_REF_ID,
  PAYMENT_TYPE,
  RECEIVERNAME,
  RECEIVERPHONE,
  SITE_NAME,
} from "./Constants";

class Cart extends Component {
  state = {
    items: [],
    loading: false,
  };

  componentDidMount() {
    this.startup();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cart !== this.props.cart) {
      this.startup();
    }
  }

  startup = async () => {
    const { cart } = this.props;

    const keys = Object.keys(cart).filter((key) => !!cart[key]);
    const promises = keys.map((id) => getGroceryItem(id));
    const data = (await Promise.all(promises)).map((d) => d.data);

    this.setState({ items: data });
  };

  handleUpdate = ({ type, item }) => {
    if (type === "PLUS") {
      this.props.addToCart(item);
    } else if (type === "MINUS") {
      this.props.removeFromCart(item);
    } else if (type === "DELETE") {
      this.props.clearFromCart(item);
    }
  };

  getOrderDetails = async (amount) => {
    try {
      this.setState({ loading: true });
      const customer = { email: CUSTOMER_EMAIL };
      const response = await fetch(MERCHANT_BACKEND_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: CURRENCY,
          order_ref_id: ORDER_REF_ID,
          customer: customer,
        }),
      });
      const json = await response.json();
      console.log("json", json);
      return json;
    } catch (error) {
      console.error(error);
    }
  };

  success = (data) => {
    var json = JSON.parse(data);
    //this is the successful payment id
    console.log(json.response.payment_id);
  };

  failed = (data) => {
    var json = JSON.parse(data);
    //this is failed payment id
    console.log(json.response.payment_id);
  };

  close = (data) => {
    var json = JSON.parse(data);
    //this is order id when closed
    console.log(json.response.order_id);
  };

  openCheckoutPage = async (amount) => {
    console.log("open checkout");
    var ordersJson = await this.getOrderDetails(amount);
    this.setState({ loading: false });
    var checkoutOptions = {
      environment: ENVIRONMENT,
      locale: LOCALE,
      site_name: SITE_NAME,
      customer_id: CUSTOMER_REF_ID,
      amount: amount.toString(),
      currency: CURRENCY,
      customer_email: CUSTOMER_EMAIL,
      order_id: ordersJson.order_id,
      access_token: ordersJson.access_token,

      payment_type: PAYMENT_TYPE,
      label: LABEL,
      landmark: LANDMARK,
      receiver_name: RECEIVERNAME,
      receiver_phone: RECEIVERPHONE,
      customer_city: CUSTOMERCITY,
      customer_region: CUSTOMERREGION,
      customer_country: CUSTOMERCOUNTRY,
      customer_postal_code: CUSTOMERPOSTALCODE,
      customer_address_line1: CUSTOMERADDRESSLINE1,
      customer_mobile: CUSTOMERMOBILE,
    };

    RNDpaySdk.open(checkoutOptions, this.success, this.failed, this.close);
  };

  render() {
    const windowHeight = Dimensions.get("window").height;

    const { cart } = this.props;

    const { items, loading } = this.state;
    const total = items.reduce((a, b) => a + cart[b.id] * b.price, 0);

    return (
      <View style={{ ...styles.container, minHeight: windowHeight }}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size='large' color='#00ff00' />
          </View>
        )}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <FontAwesome5
              style={{ margin: 12 }}
              name='chevron-left'
              color='#424242'
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
                  <Text
                    size={18}
                    color='#424242'
                    style={{ paddingTop: 4, paddingRight: 2 }}
                  >
                    Rp{" "}
                  </Text>
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
                onPress={() => this.openCheckoutPage(total)}
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
              type='cart'
              message='No Items in cart'
              description='When you are ready, go ahead and add some'
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
  activityContainer: {
    flex: 1,
    justifyContent: "center",
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
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
  cart: groceryState.cart,
});

const mapDispatchToProps = {
  addToCart,
  removeFromCart,
  clearFromCart,
};

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
