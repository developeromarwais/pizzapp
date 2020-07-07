import React from "react";
import apiCall from "../../api";
import {
    Icon,
    Input,
    Grid,
    Tab,
    Label,
    Image,
    Modal,
    Button,
    Divider,
} from "semantic-ui-react";
import swal from 'sweetalert';
import { Form } from 'formsy-semantic-ui-react';


class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            CartOpen: false,
            submitOrderLoading: false,
            TabAtiveIndex: 0,
            userCartDetails: [],
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            CartOpen: props.CartOpen,
            TabAtiveIndex: props.TabAtiveIndex,
            userCartDetails: props.userCartDetails ? props.userCartDetails.map(item => {
                item.loading = false
                return item
            }) : props.userCartDetails
        })
    }


    CartClose = () => {
        this.setState({
            CartOpen: false,
        })
        this.props.CloseCart();
    }


    getOrderDetails = (orderId) => {
        const config = {
            headers: { Authorization: `Bearer ${window.localStorage["pizzapp.api_token"]}` }
        };
        apiCall(`orderdetails/${orderId}`, "get", null, config, (res) => {
            this.setState({
                userOrderDetails: res.data,
                TabAtiveIndex: 1
            })
        }, (err) => {
        })
    }

    removeCartItem = (id) => {
        swal({
            title: "Are you sure?",
            text: "Are you sure you want to delete this cart item!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    apiCall(`cart_details/${id}`, "delete", null, null, (res) => {
                        this.props.fetchCartDetails()
                        swal("Poof! Cart Item deleted successfully!", {
                            icon: "success",
                        });
                    }, (err) => {
                    })
                }
            });
    }

    updateCart = (item) => {
        var userCartDetails = this.state.userCartDetails;
        var otherCartDetails = userCartDetails.filter(detail => detail.id !== this.state.pizzaItem.id)
        var thisCartDetails = userCartDetails.filter(detail => detail.id === this.state.pizzaItem.id)[0]
        thisCartDetails.loading = true
        otherCartDetails.push(thisCartDetails)
        var sortedCartDetails = otherCartDetails.sort((a, b) => a.id - b.id)
        this.setState({
            userCartDetails: sortedCartDetails
        })
        if (typeof (window.localStorage["pizzapp.cartId"]) !== "undefined") {
            var cartInfo = {
                "id": this.state.pizzaItem.id,
                "quantity": item.quantity,
                "describtion": item.describtion,
            };
            apiCall(`cart_details/${this.state.pizzaItem.id}`, "put", cartInfo, null, (res) => {
                userCartDetails = this.state.userCartDetails;
                otherCartDetails = userCartDetails.filter(detail => detail.id !== this.state.pizzaItem.id)
                var UpdatedCartDetails = res.data
                UpdatedCartDetails.loading = false
                UpdatedCartDetails.price = thisCartDetails.price
                UpdatedCartDetails.imageURL = thisCartDetails.imageURL
                UpdatedCartDetails.description = thisCartDetails.description
                otherCartDetails.push(UpdatedCartDetails)
                var sortedCartDetails = otherCartDetails.sort((a, b) => a.id - b.id)
                this.setState({
                    userCartDetails: sortedCartDetails
                })
                this.props.fetchCartDetails()
            }, (err) => {
            })
        }
    }



    SubmitOrder = (item) => {
        if (typeof (window.localStorage["pizzapp.cartId"]) !== "undefined") {
            let userCartDetails = this.state.userCartDetails;
            var Total_Price = userCartDetails.length > 0 ? parseFloat(userCartDetails.reduce((sum, pizza) => sum + pizza.price * pizza.quantity, 0).toFixed(2)) : 0

            swal({
                title: "Are you sure?",
                text: "Are you sure you want to submit this order with the cost of $" + parseFloat(Total_Price + 5.60).toFixed(2),
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willSubmit) => {
                    if (willSubmit) {
                        this.setState({
                            submitOrderLoading: true
                        })
                        let orderInfo = new FormData();
                        orderInfo.append('cartId', window.localStorage["pizzapp.cartId"]);
                        orderInfo.append('name', item.Firstname);
                        orderInfo.append('surname', item.Firstname);
                        orderInfo.append('address', item.address);
                        orderInfo.append('total_price', Total_Price);
                        apiCall(`orders`, "post", orderInfo, null, (res) => {
                            swal("Yummy!", "Your Pizzas are on their way!!", "success");
                            this.setState({
                                submitOrderLoading: false
                            }, () => {
                                var cartInfo = {
                                    "id": window.localStorage["pizzapp.cartId"],
                                    "status": "Closed",
                                };
                                apiCall(`carts/${window.localStorage["pizzapp.cartId"]}`, "put", cartInfo, null, (res) => {
                                    this.props.fetchCartDetails()
                                    localStorage.removeItem("pizzapp.cartId")
                                    localStorage.removeItem("pizzapp.cart")
                                    this.CartClose()
                                }, (err) => {
                                })
                            })
                        }, (err) => {
                        })

                    }
                });
        }
    }

    render() {
        const { CartOpen, TabAtiveIndex, userCartDetails, submitOrderLoading } = this.state;
        var cartDetailsTotalPrice = 0;
        if (userCartDetails) {
            cartDetailsTotalPrice = userCartDetails.length > 0 ? parseFloat(userCartDetails.reduce((sum, pizza) => {
                return sum + pizza.price * pizza.quantity
            }, 0).toFixed(2)) : 0
        }

        const panes = [
            {
                render: () => <Tab.Pane>
                    <Grid columns={2}>
                        {
                            userCartDetails.map(item => {
                                return (
                                    <>
                                        <Grid.Row style={{ fontSize: "18px" }}>
                                            <Grid.Column width={2}>
                                                <Image src={item.imageURL} size={"small"} />
                                            </Grid.Column>
                                            <Grid.Column width={5}>
                                                <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Pizza Description :</span> {item.description}
                                                <br />
                                                <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Pizza Price :</span>  ${item.price} - €{(item.price * 0.71).toFixed(2)}
                                                <br />
                                            </Grid.Column>
                                            <Grid.Column width={9}>
                                                <Form loading={item.loading} onValidSubmit={this.updateCart}>
                                                    <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Quantity :</span>
                                                    <Form.Input value={item.quantity} name="quantity" onChange={(e) => {
                                                        this.setState({
                                                            quantity: e.target.value
                                                        })
                                                    }} required={true} type={"number"} fluid placeholder='Quantity' />
                                                    <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Item description :</span>
                                                    <Form.TextArea value={item.describtion} onChange={(e) => {
                                                        this.setState({
                                                            describtion: e.target.value
                                                        })
                                                    }} name="describtion" placeholder='Example: without olives...' />
                                                    <Button type='submit' onClick={() => {
                                                        this.setState({
                                                            pizzaItem: item
                                                        })
                                                    }} positive icon='checkmark' labelPosition='right' content="Update Item" />
                                                    <Button type='button' onClick={() => {
                                                        this.removeCartItem(item.id)
                                                    }} negative icon='trash alternate outline' labelPosition='right' content="Remove Item" />
                                                </Form>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Divider />
                                    </>
                                )
                            })
                        }
                    </Grid>
                </Tab.Pane>
            },
            {
                render: () => <Tab.Pane>
                    <Form loading={submitOrderLoading} onValidSubmit={this.SubmitOrder}>
                        <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>First Name :</div>
                        <Form.Input name="Firstname" required={true} type={"text"} fluid placeholder='First Name' />
                        <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Surname :</div>
                        <Form.Input name="Surname" required={true} type={"text"} fluid placeholder='Surname' />
                        <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Address :</div>
                        <Form.TextArea name="address" required={true} placeholder='Detailed Address' />
                        <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Total Price :</div>
                        <Grid columns={5} style={{ paddingBottom: "10px" }}>
                            <Grid.Row style={{ fontSize: "18px" }}>
                                <Grid.Column width={4}>
                                    <Form.Field>
                                        <Input name="total_price" value={`$${cartDetailsTotalPrice} - €${(cartDetailsTotalPrice * 0.71).toFixed(2)}`} readOnly />
                                        <Label pointing prompt>
                                            Items Cost
                            </Label>
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={1}>
                                    <Icon name='plus' size='large' style={{ paddingTop: "10px" }} />
                                </Grid.Column>
                                <Grid.Column width={4}>
                                    <Form.Field>
                                        <Input name="Delivery Costs" value={`$5.60 - €${(5.60 * 0.71).toFixed(2)}`} readOnly />
                                        <Label pointing prompt>
                                            Delivery Costs
                            </Label>
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={1}>
                                    <Icon name='arrow right' size='large' style={{ paddingTop: "10px" }} />
                                </Grid.Column>
                                <Grid.Column width={4}>
                                    <Form.Field>
                                        <Input name="total_final_price" value={`$${parseFloat(cartDetailsTotalPrice + 5.60).toFixed(2)} - €${((parseFloat(cartDetailsTotalPrice + 5.60)) * 0.71).toFixed(2)}`} readOnly />
                                        <Label pointing prompt>
                                            Total Cost
                            </Label>
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row style={{ direction: "rtl" }}>
                                <Button type='submit' onClick={() => {
                                }} positive icon='checkmark' labelPosition='right' content="Submit Order" />
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Tab.Pane>
            },
        ]
        return (
            <Modal open={CartOpen} onClose={this.CartClose}>
                <Modal.Content style={{ maxHeight: '600px', overflowX: 'scroll' }}>
                    <Modal.Description>
                        {userCartDetails && userCartDetails.length > 0 ?
                            <Tab activeIndex={TabAtiveIndex} panes={panes} /> : "Empty Cart"
                        }
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    {userCartDetails && userCartDetails.length > 0 && (
                        <>
                            <Button color='black' onClick={this.CartClose}>
                                close
                             </Button>
                            {TabAtiveIndex === 1 && (
                                <Button type='button' onClick={() => {
                                    this.setState({
                                        TabAtiveIndex: 0
                                    })
                                }} color='grey' icon='arrow left' labelPosition='left' content="Check cart details" />
                            )}
                            {TabAtiveIndex === 0 && (
                                <Button type='button' onClick={() => {
                                    this.setState({
                                        TabAtiveIndex: 1
                                    })
                                }} color='blue' icon='arrow right' labelPosition='right' content="Complete Order Info & Submit" />
                            )}
                        </>
                    )}

                </Modal.Actions>
            </Modal>
        )
    }
}
export default Cart;
