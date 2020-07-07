import React from "react";
import {
  Icon,
  Menu,
  Segment,
  Sidebar,
  Grid,
  Transition,
  Card,
  Label,
  Image,
  Modal,
  Button,
} from "semantic-ui-react";
import { Form } from 'formsy-semantic-ui-react';
import SignIn from '../../components/SignIn/index'
import Orders from '../../components/Orders/index'
import Cart from '../../components/Cart/index'
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
      singInMode: 0,
      SignInOpen: false,
      OrdersOpen: false,
      animateCart: true,
      cartOpen: false,
      userIsIn: false,
      TabAtiveIndex: 0,
      submitOrderLoading: false,
      menu: [],
    };
  }
  show = (dimmer) => {
    this.setState({ dimmer, open: true })
  }
  close = () => {
    this.setState({
      open: false
    }, () => {
      this.toggleVisibility()
    })
  }

  Cartshow = (dimmer) => {
    this.setState({ dimmer, cartOpen: true })
  }
  Cartclose = () => {
    this.setState({ cartOpen: false })
  }

  cartFetchDetails = () => {
    this.fetchCartDetails();
  }

  UserIsIn = () => {
    this.setState({ userIsIn: true })
  }





  add2Cart = (e) => {
    this.setState({
      formLoading: true
    })
    if (typeof (window.localStorage["pizzapp.cartId"]) === "undefined") {
      let cartInfo = new FormData();
      if (this.state.userIsIn && typeof (window.localStorage["pizzapp.userId"]) !== "undefined") {
        cartInfo.append('UserId', window.localStorage["pizzapp.userId"]);
      }
      apiCall(`carts`, "post", cartInfo, null, (res) => {
        window.localStorage["pizzapp.cartId"] = res.data.id;
        this.addCartDetails();
      }, (err) => {
      })
    } else {
      this.addCartDetails();
    }
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
      // swal("Yummy!", "Pizza has been added to cart", "success");
      swal({
        buttons: {
          review: {
            text: "Review your cart!",
            value: "review",
          },
          add: {
            text: "Add another Pizza 🍕!",
            value: "add",
          },
          submit: {
            text: "Submit your order!",
            value: "submit",
          },
        },
        icon: "success",
        title: "Yummy!",
        text: "Pizza has been added to cart!",
      })
        .then((value) => {
          switch (value) {
            case "review":
              this.setState({
                cartOpen: true,
                TabAtiveIndex: 0
              }); break;
            case "add":
              this.setState({
                visible: true,
              }); break;
            case "submit":
              this.setState({
                cartOpen: true,
                TabAtiveIndex: 1
              }); break;
            default:
          }
        });

      this.fetchCartDetails()
      this.setState({
        formLoading: false,
      }, () => {
        this.close()
      })
    }, (err) => {
    })
  }

  toggleVisibility = () => this.setState(prevState => ({ animateCart: !prevState.animateCart }));

  logOut = () => {
    const config = {
      headers: { Authorization: `Bearer ${window.localStorage["pizzapp.api_token"]}` }
    };
    apiCall(`logout`, "post", null, config, (res) => {
      localStorage.removeItem("pizzapp.api_token")
      localStorage.removeItem("pizzapp.userId")
      this.setState({
        userIsIn: false
      })
    }, (err) => {
    })
  }

  componentDidMount() {
    this.fetchPizzas();
    this.fetchCartDetails();
    if (typeof (window.localStorage["pizzapp.api_token"]) !== "undefined") {
      this.setState({ userIsIn: true })
    }
  }

  fetchCartDetails() {
    if (typeof (window.localStorage["pizzapp.cartId"]) !== "undefined") {
      apiCall(
        `carts/getCartDetails/${window.localStorage["pizzapp.cartId"]}`,
        "get",
        null,
        null,
        (res) => {
          var userCartDetailsObject = res.data;
          userCartDetailsObject.map((item) => {
            return item.loading = false
          })
          var sortedCartDetails = userCartDetailsObject.sort((a, b) => b.created_at - a.created_at)
          this.setState({
            userCartDetails: sortedCartDetails
          });
        },
        (err) => { }
      );
    }
  }

  fetchPizzas() {
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

  CloseSignIn = () => {
    this.setState({
      SignInOpen: false
    })
  }

  CloseOrders = () => {
    this.setState({
      OrdersOpen: false
    })
  }

  render() {
    const { open, dimmer, menu, pizzaItem, cartOpen, userCartDetails, SignInOpen, singInMode, userIsIn, animateCart, OrdersOpen, TabAtiveIndex } = this.state


    return (
      <>
        <SignIn SignInOpen={SignInOpen} mode={singInMode} userIsIn={this.UserIsIn} CloseSignIn={this.CloseSignIn} />
        <Orders OrdersOpen={OrdersOpen} CloseOrders={this.CloseOrders} />
        <Cart fetchCartDetails={this.cartFetchDetails} TabAtiveIndex={TabAtiveIndex} userCartDetails={userCartDetails} CartOpen={cartOpen} CloseCart={this.Cartclose} />


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
                      <Menu size={"small"} fixed={"top"}  >
                        <Menu.Item style={{ zIndex: 2, cursor: "pointer" }} onClick={() => {
                          this.setState({
                            cartOpen: true,
                            TabAtiveIndex: 0
                          })
                        }} position='right'>
                          <Transition animation={"tada"} duration={500} visible={animateCart}>
                            <Icon inverted color='black' name='shopping cart' size='huge' />
                          </Transition>
                          <Label circular color={"red"} key={"red"}>
                            {
                              userCartDetails ? userCartDetails.length : 0
                            }
                          </Label>
                        </Menu.Item>
                        <Menu.Item style={{ zIndex: 2, cursor: "pointer" }}>
                          {userIsIn && (
                            <>
                              <Button type='button' onClick={() => {
                                this.setState({
                                  OrdersOpen: true
                                })
                              }} color="blue" icon='box' labelPosition='right' content="Orders" />
                              <div style={{ width: '10px' }}>
                                {" "}
                              </div>
                              <Button type='button' onClick={() => {
                                this.logOut()
                              }} negative icon='log out' labelPosition='right' content="Logout" />
                            </>

                          )}
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
                            <div className="headline">PIZZAPP <span role="img" aria-label="pizza">🍕</span></div>
                            <p className="body long">Browse from our menu</p>
                          </div>
                          <Grid columns={2}>
                            <Grid.Row style={{ fontSize: "18px" }}>
                              <Grid.Column width={2}>
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
                              </Grid.Column>
                              <Grid.Column width={2}>
                                <div className="buttons">
                                  <div className="button sho-play-link">
                                    <span
                                      onClick={() => {
                                        this.setState({
                                          cartOpen: true,
                                        });
                                      }}
                                    >
                                      Open cart
                                      </span>
                                  </div>
                                </div>
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>

                        </div>


                        {!userIsIn && (
                          <div className="promo-text">
                            <span className="dash"></span>
                            <span className="promo-flag">
                              To be able to track your orders <br /> please Sign up or sign in <br /> before adding items to the cart
                             </span>
                            <Grid columns={2}>
                              <Grid.Row style={{ fontSize: "18px" }}>
                                <Grid.Column width={2}>
                                  <div className="buttons">
                                    <div className="button sho-play-link">
                                      <span onClick={() => {
                                        this.setState({ SignInOpen: true, singInMode: 1 })
                                      }}>
                                        Sign Up
                                      </span>
                                    </div>
                                  </div>
                                </Grid.Column>
                                <Grid.Column width={2}>
                                  <div className="buttons">
                                    <div className="button sho-play-link">
                                      <span onClick={() => {
                                        this.setState({ SignInOpen: true, singInMode: 0 })
                                      }}>
                                        Sign In
                                      </span>
                                    </div>
                                  </div>
                                </Grid.Column>
                              </Grid.Row>
                            </Grid>
                          </div>
                        )}


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
