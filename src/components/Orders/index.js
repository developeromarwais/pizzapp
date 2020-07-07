import React from "react";
import apiCall from "../../api";
import {
    Grid,
    Tab,
    Image,
    Modal,
    Button,
    Divider,
} from "semantic-ui-react";


class Orders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            OrdersOpen: false,
            TabAtiveIndex: 0,
            userOrders: [],
            userOrderDetails: [],
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            OrdersOpen: props.OrdersOpen
        }, () => {
            if (this.state.OrdersOpen) {
                const config = {
                    headers: { Authorization: `Bearer ${window.localStorage["pizzapp.api_token"]}` }
                };
                apiCall(`userorders`, "get", null, config, (res) => {
                    this.setState({
                        userOrders: res.data
                    })
                }, (err) => {
                })
            }
        })
    }


    OrdersClose = () => {
        this.setState({
            OrdersOpen: false,
        })
        this.props.CloseOrders();
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

    render() {
        const { OrdersOpen, userOrders, TabAtiveIndex, userOrderDetails } = this.state;
        const panes = [
            {
                render: () => <Tab.Pane>
                    <Grid columns={2}>
                        {userOrders.map(item => {
                            return (
                                <>

                                    <Grid.Row style={{ fontSize: "18px" }}>
                                        <Grid.Column width={16}>
                                            <span style={{ color: "#7b7b7b", fontSize: "18px" }}> Name :</span> {item.name}
                                            <br />
                                            <span style={{ color: "#7b7b7b", fontSize: "18px" }}> Surname :</span> {item.surname}
                                            <br />
                                            <span style={{ color: "#7b7b7b", fontSize: "18px" }}> Address :</span>  {item.address}
                                            <br />
                                            <span style={{ color: "#7b7b7b", fontSize: "18px" }}> Total Price :</span>  ${item.total_price} - €{(item.total_price * 0.71).toFixed(2)}
                                            <br />
                                            <span style={{ color: "#7b7b7b", fontSize: "18px" }}> Created at :</span>  {item.created_at}
                                            <br />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{ textAlign: "right" }}>
                                        <Grid.Column width={16}>
                                            <Button type='submit' positive icon='arrow right' onClick={() => {
                                                this.getOrderDetails(item.id)
                                            }} labelPosition='right' content="See Order Details" />
                                        </Grid.Column>
                                        <Divider />
                                    </Grid.Row>
                                </>
                            )
                        })}
                    </Grid>
                </Tab.Pane >
            },
            {
                render: () => <Tab.Pane>
                    <Grid columns={2}>
                        {
                            userOrderDetails.map(item => {
                                return (
                                    <>
                                        <Grid.Row style={{ fontSize: "18px" }}>
                                            <Grid.Column width={6}>
                                                <Image src={item.imageURL} size={"big"} />
                                            </Grid.Column>
                                            <Grid.Column width={10}>
                                                <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Pizza Description :</span> {item.description}
                                                <br />
                                                <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Pizza Price :</span>  ${item.price} - €{(item.price * 0.71).toFixed(2)}
                                                <br />
                                                <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Quantity :</span> {item.quantity}
                                                <br />
                                                <span style={{ color: "#7b7b7b", fontSize: "18px" }}>Description :</span>  {item.describtion}
                                                <br />
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Divider />
                                    </>
                                )
                            })
                        }
                    </Grid>
                </Tab.Pane >
            },
        ]
        return (<Modal open={OrdersOpen} onClose={this.OrdersClose}>
            <Modal.Content style={{ maxHeight: '600px', overflowX: 'scroll' }}>
                <Modal.Description>
                    <Tab activeIndex={TabAtiveIndex} panes={panes} />
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                {TabAtiveIndex === 1 && (
                    <Button type='submit' positive icon='arrow left' onClick={() => {
                        this.setState({
                            TabAtiveIndex: 0
                        })
                    }} color={'grey'} labelPosition='right' content="Back to orders" />
                )}
                <Button color='black' onClick={this.OrdersClose}>
                    close
            </Button>
            </Modal.Actions>
        </Modal>)
    }
}
export default Orders;
