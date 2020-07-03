import React from "react";
// import { useBooleanKnob } from "@stardust-ui/docs-components";
import { Icon, Menu, Segment, Sidebar } from "semantic-ui-react";

class SidebarNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }
  render() {
    return (
      
      <Sidebar.Pushable as={Segment}>
        <Sidebar
          as={Menu}
          icon="labeled"
          animation={"slide out"}
          direction="right"
          inverted
          onHide={() =>
            this.setState({
              visible: !this.state.visible,
            })
          }
          vertical
          visible={this.state.visible}
          width="thin"
        >
          <Menu.Item as="a">
            <Icon name="home" />
            Home
          </Menu.Item>
          <Menu.Item as="a">
            <Icon name="gamepad" />
            Games
          </Menu.Item>
          <Menu.Item as="a">
            <Icon name="camera" />
            Channels
          </Menu.Item>
        </Sidebar>

        <Sidebar.Pusher>
          <Segment basic>{this.props.content}</Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    
    );
  }
}

export default SidebarNav;
