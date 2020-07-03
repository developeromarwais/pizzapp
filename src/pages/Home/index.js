import React from "react";
import {
  Icon,
  Menu,
  Segment,
  Sidebar,
  Card,
  Image,
  Modal,
  Button,
} from "semantic-ui-react";
import apiCall from "../../api";
import "./style.scss";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      pizzaItem: {},
      open: false,
      menu: [],
    };
  }
  show = (dimmer) => {
    this.setState({ dimmer, open: true })
  }
  close = () => this.setState({ open: false })


  componentDidMount() {
    this.fetchPosts();
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
    const { open, dimmer, menu, pizzaItem } = this.state
    return (
      <>

        <Modal dimmer={dimmer} open={open} onClose={this.close}>
          <Modal.Header>{`Add ${pizzaItem.name} to Cart`}</Modal.Header>
          <Modal.Content image>
            <Image
              wrapped
              size='medium'
              src={pizzaItem.imageURL}
            />
            <Modal.Description>
              <p>
                {pizzaItem.description}
              </p>
              <p>
                <span className="date">{`$${pizzaItem.price} - €${(pizzaItem.price * 0.71).toFixed(2)}`}</span>
              </p>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color='black' onClick={this.close}>
              Nope
            </Button>
            <Button
              positive
              icon='checkmark'
              labelPosition='right'
              content="Yep, that's me"
              onClick={this.close}
            />
          </Modal.Actions>
        </Modal>
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            icon="labeled"
            animation={"slide along"}
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
