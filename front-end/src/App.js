import React, { Component } from 'react';
import './App.css';

//local imports
import SignUp from './SignUp/SignUp.js';
import TipInfoForm from './Components/TipInfoForm/TipInfoForm';
import Map from './Components/Map/map.js';  

// react-bootstrap
import Navbar from 'react-bootstrap/Navbar'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'

//for maps
import styled from 'styled-components';

// View Component
import ViewTipInfo from './Components/ViewTipInfo/ViewTipInfo';
import './Components/ViewTipInfo/ViewTipInfo.css';

//aws imports
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import awsmobile from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
import { Connect } from 'aws-amplify-react';
import aws_config from './aws-exports';

//graphql related imports
import * as queries from './graphql/queries'
import * as mutations from './graphql/mutations'
import * as subscriptions from './graphql/subscriptions'

import logo from './images/logo.png'


Amplify.configure(awsmobile);
Amplify.configure(aws_config);

// component to get data from user / guest

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      showHome: true,
      showSignUp: false,
      showTipUpdate: false,
      curr_user_username: '',
      showListView: true,
      showMapView: false,
    }

    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleTipUpdate = this.handleTipUpdate.bind(this);
    this.handleChangeView = this.handleChangeView.bind(this);
  }

  handleSignUp = () => {
    this.setState({
      showHome: !this.state.showHome,
      showSignUp: !this.state.showSignUp
    });
  }

  handleTipUpdate = () => {
    this.setState({
      showHome: !this.state.showHome,
      showTipUpdate: !this.state.showTipUpdate
    })
  }

  handleChangeView = () => {
    this.setState({
      showListView: !this.state.showListView,
      showMapView: !this.state.showMapView,
    })
  }
  
  //this grabs username attribute from current user.  
  //componentDidMount is executed after the webpage is rendered,
  //allowing for the page to be reloaded with data from API calls?

  async componentDidMount() {
    let current_user = await Auth.currentAuthenticatedUser();
    let un = current_user.username;
    this.setState({
      curr_user_username: un
    })
  }

  render() {

    const home = (
      <Navbar className="bg-olive justify-content-between">

        {/* TODO: update the logo with Navbar.Brand */}
      <Navbar.Brand>
        <img
        src={ logo }
        width="200"
        height="64"
        className="d-inline-block align-top"
        alt="Pooled House logo"
      />
      </Navbar.Brand>
        <Form inline>
          <FormControl type="text" placeholder="ex: upper manhattan" className="mr-sm" />
          <Button type="submit" variant="outline-light"><span>{"\uD83D\uDD0D"}</span></Button>
        </Form>

        <ButtonToolbar>
          <ToggleButtonGroup type="radio" name="options" defaultValue={1} onChange={this.handleChangeView}>
            <ToggleButton value={1} variant="warning">List View</ToggleButton>
            <ToggleButton value={2} variant="warning">Map View</ToggleButton>
          </ToggleButtonGroup>
        </ButtonToolbar>
        
        <ButtonToolbar>
          <Button 
            className="text-color-white" 
            onClick={this.handleTipUpdate}>Tip Update
          </Button>
        </ButtonToolbar>
      </Navbar>
      );

      const list_view = (
        <Connect query={graphqlOperation(queries.listTipEntrys)}>
        {({ data: { listTipEntrys }, loading, error }) => {
            if (error) return (<h3>Error</h3>);
            if (loading || !listTipEntrys) return (<h3>Loading...</h3>);
            return (<ViewTipInfo tipInfo={listTipEntrys.items} /> );
        }}
        </Connect>
      );

    return (
      <div className="App">
        <div id="home"> { home } </div>
        {this.state.showTipUpdate ? <TipInfoForm handler={this.handleTipUpdate}/> : null }
        {/* the connect component queries our database and then passes the query
          result to the ListView function */} 
        {this.state.showListView ? <div> { list_view } </div> : <Map />}
      </div>
    );
  }
}

export default withAuthenticator(App, true);