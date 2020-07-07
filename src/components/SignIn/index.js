import React from "react";
import apiCall from "../../api";
import {
    Grid,
    Tab,
    Modal,
    Button,
} from "semantic-ui-react";
import { Form } from 'formsy-semantic-ui-react';


class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            TabAtiveIndex: 0,
            formLoading: false,
            validationSummary: {
                password: "",
                email: "",
                validated: true,
            },
            SignInOpen: false
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            TabAtiveIndex: props.mode,
            SignInOpen: props.SignInOpen
        })
    }


    SingInClose = () => {
        this.setState({
            SignInOpen: false,
            validationSummary: {
                validated: true,
                email: "",
                password: ""
            }
        })
        this.props.CloseSignIn();
    }

    SignInSubmit = (formInfo) => {
        let Login = new FormData();
        Login.append('email', formInfo.email);
        Login.append('password', formInfo.password);
        apiCall(`login`, "post", Login, null, (res) => {
            this.setState({
                validationSummary: {
                    validated: true,
                    email: "",
                    password: ""
                }
            })
            window.localStorage["pizzapp.api_token"] = res.data.data.api_token;
            window.localStorage["pizzapp.userId"] = res.data.data.id;
            this.SingInClose()
            debugger
            this.props.userIsIn()
            debugger
            if (typeof (window.localStorage["pizzapp.cartId"]) !== "undefined") {
                var cartInfo = {
                    "id": window.localStorage["pizzapp.cartId"],
                    "UserId": res.data.data.id,
                };
                apiCall(`carts/${window.localStorage["pizzapp.cartId"]}`, "put", cartInfo, null, (res) => {
                }, (err) => {
                })
            }

        }, (err) => {
            debugger
            if (err.response.status === 422) {
                this.setState({
                    validationSummary: {
                        validated: false,
                        email: err.response.data.errors.email ? err.response.data.errors.email[0] : "",
                        password: err.response.data.errors.password ? err.response.data.errors.password[0] : ""
                    }
                })
            }
        })
    }

    SignUp = (formInfo) => {
        let SignUp = new FormData();
        SignUp.append('name', formInfo.name);
        SignUp.append('surname', formInfo.surname);
        SignUp.append('email', formInfo.email);
        SignUp.append('password', formInfo.password);
        SignUp.append('password_confirmation', formInfo.password_confirmation);
        apiCall(`register`, "post", SignUp, null, (res) => {
            this.setState({
                validationSummary: {
                    validated: true,
                    email: "",
                    password: ""
                }
            })
            window.localStorage["pizzapp.api_token"] = res.data.data.api_token;
            window.localStorage["pizzapp.userId"] = res.data.data.id;
            this.SingInClose()
            this.props.userIsIn()
            if (typeof (window.localStorage["pizzapp.cartId"]) !== "undefined") {
                var cartInfo = {
                    "id": window.localStorage["pizzapp.cartId"],
                    "UserId": res.data.data.id,
                };
                apiCall(`carts/${window.localStorage["pizzapp.cartId"]}`, "put", cartInfo, null, (res) => {
                }, (err) => {
                })
            }

        }, (err) => {
            if (err.response.status === 422) {
                this.setState({
                    validationSummary: {
                        validated: false,
                        email: err.response.data.errors.email ? err.response.data.errors.email[0] : "",
                        password: err.response.data.errors.password ? err.response.data.errors.password[0] : ""
                    }
                })
            }
        })
    }

    render() {
        const { TabAtiveIndex, SignInOpen, formLoading, validationSummary } = this.state;
        const panes = [
            {
                render: () => <Tab.Pane>
                    <Form loading={formLoading} onValidSubmit={this.SignInSubmit}>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Email :</div>
                                    <Form.Input name="email" required={true} type={"email"} placeholder='Email' />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Password :</div>
                                    <Form.Input name="password" required={true} type={"password"} placeholder='Password' />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row style={{ textAlign: "right" }}>
                                <Grid.Column width={16}>
                                    <Button type='submit' positive icon='checkmark' labelPosition='right' content="Sign In" />
                                </Grid.Column>
                                <Grid.Column width={16}>
                                    {validationSummary.validated &&
                                        <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}> :</div>
                                    }
                                    {validationSummary.email.length > 0 &&
                                        (<>
                                            <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Email :  <span style={{ color: "red" }}>{validationSummary.email}</span></div>

                                        </>)
                                    }
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Tab.Pane >
            },
            {
                render: () => <Tab.Pane>
                    <Form loading={formLoading} onValidSubmit={this.SignUp}>
                        <Grid columns={2}>
                            <Grid.Row>
                                <Grid.Column>
                                    <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>First Name :</div>
                                    <Form.Input name="name" required={true} type={"text"} placeholder='First Name' />
                                </Grid.Column>
                                <Grid.Column>
                                    <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Surname :</div>
                                    <Form.Input name="surname" required={true} type={"text"} placeholder='Surname' />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Password :</div>
                                    <Form.Input name="password" required={true} type={"password"} placeholder='Password' />
                                </Grid.Column>
                                <Grid.Column>
                                    <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Password confirmation :</div>
                                    <Form.Input name="password_confirmation" required={true} type={"password"} placeholder='Password confirmation' />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Email :</div>
                                    <Form.Input name="email" required={true} type={"email"} placeholder='Email' />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row style={{ textAlign: "right" }}>
                                <Grid.Column width={16}>
                                    <Button type='submit' positive icon='checkmark' labelPosition='right' content="Sign Up" />
                                </Grid.Column>
                                <Grid.Column width={16}>
                                    {validationSummary.validated &&
                                        <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}> :</div>
                                    }
                                    {validationSummary.email.length > 0 &&
                                        (<>
                                            <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Email :  <span style={{ color: "red" }}>{validationSummary.email}</span></div>

                                        </>)
                                    }
                                    {validationSummary.password.length > 0 &&
                                        (<>
                                            <div style={{ color: "#7b7b7b", fontSize: "18px", textAlign: "left", padding: "10px" }}>Password : <span style={{ color: "red" }}>{validationSummary.password}</span></div>

                                        </>)
                                    }
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Tab.Pane >
            },
        ]
        return (
            <>
                <Modal open={SignInOpen} onClose={this.SingInClose}>
                    <Modal.Content >
                        <Modal.Description>
                            <Tab activeIndex={TabAtiveIndex} panes={panes} />
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        {TabAtiveIndex === 0 && (
                            <Button type='button' onClick={() => {
                                this.setState({
                                    TabAtiveIndex: 1
                                })
                            }} color='blue' icon='arrow right' labelPosition='right' content="Go to Sign Up" />
                        )}
                        {TabAtiveIndex === 1 && (
                            <Button type='button' onClick={() => {
                                this.setState({
                                    TabAtiveIndex: 0
                                })
                            }} color='blue' icon='arrow right' labelPosition='right' content="Go to Sign In" />
                        )}

                    </Modal.Actions>
                </Modal>
            </>
        )
    }
}
export default SignIn;
