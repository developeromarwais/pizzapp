import React from "react";
import {
  Icon,
  Menu,
  Input,
  Segment,
  Sidebar,
  Grid,
  Tab,
  Card,
  Label,
  Image,
  Modal,
  Button,
  Divider,
} from "semantic-ui-react";
import { Form } from 'formsy-semantic-ui-react';
import apiCall from "../../api";
import swal from 'sweetalert';
import "./style.scss";

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      pizzaItem: {},
      formLoading: false,
      quantity: 1,
      describtion: "",
      valid: false,
      open: false,
      userCartDetails: [],
      cartOpen: false,
      TabAtiveIndex: 0,
      submitOrderLoading: false,
      menu: [],
    };
  }
  show = (dimmer) => {
    this.setState({ dimmer, open: true })
  }
  close = () => this.setState({ open: false })

  Cartshow = (dimmer) => {
    this.setState({ dimmer, cartOpen: true })
  }
  Cartclose = () => this.setState({ cartOpen: false })


  SubmitOrder = (item) => {
    if (typeof (window.localStorage["pizzapp.cartId"]) !== "undefined") {
      let userCartDetails = this.state.userCartDetails;

      let Total_Price = userCartDetails.length > 1 ? parseFloat((userCartDetails.reduce((a, b) => {
        return parseFloat(parseFloat(a.price * a.quantity) + parseFloat(b.price * b.quantity));
      }) + 5.60).toFixed(2)) : userCartDetails.length > 0 ? (parseFloat(userCartDetails[0].price * userCartDetails[0].quantity) + 5.60).toFixed(2) : 0;

      swal({
        title: "Are you sure?",
        text: "Are you sure you want to submit this order with the cost of $" + Total_Price,
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
                  "id": this.state.pizzaItem.id,
                  "status": "Closed",
                };
                apiCall(`carts/${window.localStorage["pizzapp.cartId"]}`, "put", cartInfo, null, (res) => {
                  this.fetchCartDetails()
                  localStorage.removeItem("pizzapp.cartId")
                  localStorage.removeItem("pizzapp.cart")
                  this.Cartclose()
                }, (err) => {
                })
              })
            }, (err) => {
            })

          }
        });
    }
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
      }, (err) => {
      })
    }
  }

  add2Cart = (e) => {
    this.setState({
      formLoading: true
    })
    if (typeof (window.localStorage["pizzapp.cartId"]) === "undefined") {
      let cartInfo = new FormData();
      apiCall(`carts`, "post", cartInfo, null, (res) => {
        window.localStorage["pizzapp.cartId"] = res.data.id;
        this.addCartDetails();
      }, (err) => {
      })
    } else {
      this.addCartDetails();
    }
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
            this.fetchCartDetails()
            swal("Poof! Cart Item deleted successfully!", {
              icon: "success",
            });
          }, (err) => {
          })
        }
      });
  }

  addCartDetails = (values) => {
    let cartDetailsInfo = new FormData();
    cartDetailsInfo.append('quantity', this.state.quantity);
    cartDetailsInfo.append('cartId', window.localStorage["pizzapp.cartId"]);
    cartDetailsInfo.append('pizzaId', this.state.pizzaItem.id);
    cartDetailsInfo.append('describtion', this.state.describtion === "" ? "" : this.state.describtion);
    this.close()
    this.setState({
      formLoading: false
    })
    apiCall(`cart_details`, "post", cartDetailsInfo, null, (res) => {
      var cartArray = [];
      if (typeof (window.localStorage["pizzapp.cart"]) === "undefined") {
        cartArray.push(res)
        window.localStorage["pizzapp.cart"] = JSON.stringify(cartArray)
      } else {
        cartArray = JSON.parse(window.localStorage["pizzapp.cart"])
        cartArray.push(res)
        window.localStorage["pizzapp.cart"] = JSON.stringify(cartArray)
      }
      swal("Yummy!", "Pizza has been added to cart", "success");

      this.fetchCartDetails()
      this.setState({
        formLoading: false
      }, () => {
        this.close()
      })
    }, (err) => {
    })
  }


  componentDidMount() {
    this.fetchPosts();
    this.fetchCartDetails();
  }

  fetchCartDetails() {
    if (typeof (window.localStorage["pizzapp.cartId"]) !== "undefined") {
      apiCall(
        `carts/getCartDetails/${window.localStorage["pizzapp.cartId"]}`,
        "get",
        null,
        null,
        (res) => {
          var userCartDetails = res.data;
          userCartDetails.map((item) => {
            return item.loading = false
          })
          var sortedCartDetails = userCartDetails.sort((a, b) => b.created_at - a.created_at)
          this.setState({
            userCartDetails: sortedCartDetails
          });
        },
        (err) => { }
      );
    }
  }

  fetchPosts() {
    apiCall(
      "pizzas",
      "get",
      null,
      null,
      (res) => {
        this.setState({
          menu: res.data,
        });
      },
      (err) => { }
    );
  }

  render() {
    const { open, dimmer, menu, pizzaItem, cartOpen, userCartDetails, submitOrderLoading, TabAtiveIndex } = this.state
    var cartDetailsTotalPrice = userCartDetails.length > 1 ? parseFloat(userCartDetails.reduce((a, b) => {
      return parseFloat(parseFloat(a.price * a.quantity) + parseFloat(b.price * b.quantity));
    }).toFixed(2)) : userCartDetails.length > 0 ? parseFloat(userCartDetails[0].price * userCartDetails[0].quantity) : 0;
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
      <>
        <Modal open={cartOpen} onClose={this.Cartclose}>
          <Modal.Content >
            <Modal.Description>

              {userCartDetails.length > 0 ?
                <Tab activeIndex={TabAtiveIndex} panes={panes} /> : "Empty Cart"
              }
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            {userCartDetails.length > 0 && (
              <>
                <Button color='black' onClick={this.Cartclose}>
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

        <Modal dimmer={dimmer} open={open} onClose={this.close}>
          <Modal.Header>{`Add ${pizzaItem.name} to Cart`}</Modal.Header>
          <Modal.Content image>
            <Image
              wrapped
              size='medium'
              src={pizzaItem.imageURL}
            />
            <Modal.Description>
              <Form loading={this.state.formLoading} onValidSubmit={this.add2Cart}>
                <p>
                  {pizzaItem.description}
                </p>
                <p>
                  <span className="date">{`$${pizzaItem.price} - €${(pizzaItem.price * 0.71).toFixed(2)}`}</span>
                </p>
                <Form.Input name="quan" onChange={(e) => {
                  this.setState({
                    quantity: e.target.value
                  })
                }} required={true} type={"number"} fluid label='Quantity' placeholder='Quantity' />
                <Form.TextArea onChange={(e) => {
                  this.setState({
                    describtion: e.target.value
                  })
                }} name="desc" label='Item description' placeholder='Example: without olives...' />
                <Button type='submit' positive icon='checkmark' labelPosition='right' content="Add to cart" />
              </Form>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color='black' onClick={this.close}>
              close
            </Button>

          </Modal.Actions>
        </Modal>

        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            icon="labeled"
            animation={"uncover"}
            direction="right"
            inverted
            onHide={() =>
              this.setState({
                visible: false,
              })
            }
            width="very wide"
            vertical
            visible={this.state.visible}
          >
            <Menu.Item>
              <Card.Group itemsPerRow={2}>
                {menu.map((item) => {
                  return (
                    <Card raised>
                      <Image src={item.imageURL} wrapped ui={false} />
                      <Card.Content>
                        <Card.Header>{item.name}</Card.Header>
                        <Card.Meta>
                          <span className="date">{`$${item.price} - €${(item.price * 0.71).toFixed(2)}`}</span>
                        </Card.Meta>
                        <Card.Description>{item.description}</Card.Description>
                      </Card.Content>
                      <Card.Content extra>
                        <Button onClick={() => {
                          this.setState({
                            pizzaItem: item
                          })
                          this.show('blurring')
                        }} animated="vertical">
                          <Button.Content hidden>
                            <Icon name="shop" />
                          </Button.Content>
                          <Button.Content visible>Add to Cart</Button.Content>
                        </Button>
                      </Card.Content>
                    </Card>
                  );
                })}
              </Card.Group>
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher>
            <Segment basic>
              <div className="promotion-carousel">
                <div className="promotions">
                  <div>
                    <div
                      className="promotion"
                      id="section1"
                      style={{
                        backgroundImage:
                          "url(https://steemitimages.com/DQmXFAYnwt36DiQmzvcahwNmBpb7kWJyeKS8DMUoHgMTSmZ/Pizza-HD-Desktop-Wallpaper-15280.jpg)",
                      }}
                    >
                      <Menu style={{ background: "transparent", border: "none" }} color={"red"} borderless={true} attached='top'>
                        <Menu.Item style={{ zIndex: 2, cursor: "pointer" }} onClick={() => {
                          this.setState({
                            cartOpen: true,
                            TabAtiveIndex: 0
                          })
                        }} position='right'>
                          <Icon inverted color='black' name='shopping cart' size='huge' />
                          <Label circular color={"red"} key={"red"}>
                            {
                              userCartDetails.length
                            }
                          </Label>
                        </Menu.Item>
                      </Menu>
                      <div className="shade"></div>
                      <div className="promo-detail cycle-overlay">
                        <div className="promo-text">
                          <span className="dash"></span>
                          <span className="promo-flag">
                            Get Your favoraite PIZZA from
                        </span>
                          <div className="copy">
                            <div className="headline">PIZZAPP</div>
                            <p className="body long">Browse from our menu</p>
                          </div>
                          <div className="buttons">
                            <div className="button sho-play-link">
                              <span
                                onClick={() => {
                                  this.setState({
                                    visible: true,
                                  });
                                }}
                              >
                                Show menu
                            </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </>

    );
  }
}

export default Home;
