import React from "react";
import {
  Icon,
  Menu,
  Segment,
  Sidebar,
  Card,
  Image,
  Button,
} from "semantic-ui-react";
import apiCall from "../../api";
import "./style.scss";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      menu: [],
    };
  }

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
      (err) => {}
    );
  }

  render() {
    return (
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
              {this.state.menu.map((item) => {
                return (
                  <Card raised>
                    <Image src={item.imageURL} wrapped ui={false} />
                    <Card.Content>
                      <Card.Header>{item.name}</Card.Header>
                      <Card.Meta>
                        <span className="date">{item.price}</span>
                      </Card.Meta>
                      <Card.Description>{item.description}</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <Button animated="vertical">
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
    );
  }
}

export default Home;
