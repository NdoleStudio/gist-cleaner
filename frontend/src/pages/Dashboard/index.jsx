import React, {Component} from 'react';
import 'pretty-checkbox';
import './style.scss';
import '@mdi/font/css/materialdesignicons.min.css';
import logo from '../../images/logo.png'
import iconDelete from '../../images/icon-delete.png';
import closeIcon from '../../images/close-icon.svg';
import {ROUTE_LANDING_PAGE, BASE_INPUT_CLASS, BASE_BUTTON_CLASS, API_ENDPOINT_DASHBOARD, API_ENDPOINT_DELETE} from "../../constants/constants";
import CheckBox from '../../components/CheckBox';
import postscribe from 'postscribe';
import {API_RESPONSE} from "../../services/api";
import moment from "moment";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import axios from "axios";



class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedGists: [],
      gists: [],
      name: '',
      avatar_url: '',
      username: '',
      displayModal: false,
      usernameInput: '',
      bio: '',
      access_token: null
    };

    this.openDisplayModal = this.openDisplayModal.bind(this);
    this.closeDisplayModal = this.closeDisplayModal.bind(this);
    this.handleUsernameInputChange = this.handleUsernameInputChange.bind(this);
    this.deleteButtonClicked = this.deleteButtonClicked.bind(this);

    toast.configure({
      autoClose: 8000,
    });
  }

  componentDidMount() {
    console.log(window.location.search);
    console.log(new URLSearchParams(window.location.search).get('code'));
    //
    // this.setState({
    //   gists: API_RESPONSE.gists,
    //   name: API_RESPONSE.name,
    //   url: API_RESPONSE.url,
    //   bio: API_RESPONSE.bio,
    //   username: API_RESPONSE.username,
    //   avatar_url: API_RESPONSE.avatar_url,
    //   access_token: API_RESPONSE.access_token,
    // }, () => {
    //   this.state.gists.map((gist) => {
    //     return postscribe('#' + gist.id, '<script src="https://gist.github.com/' + this.state.username + '/' + gist.name + '.js"></script>');
    //   });
    // });
    fetch(API_ENDPOINT_DASHBOARD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        code: new URLSearchParams(window.location.search).get('code')
      })
    }).then(response => response.json()).then(data => {
      console.log(data);
      this.setState({
        gists: data.gists,
        name: data.name,
        url: data.url,
        bio: data.bio,
        username: data.username,
        avatar_url: data.avatar_url,
        access_token: data.access_token,
      }, () => {
        this.state.gists.map((gist) => {
          return postscribe('#' + gist.id, '<script src="https://gist.github.com/' + this.state.username + '/' + gist.name + '.js"></script>');
        });
      });
    });
  }

  handleUsernameInputChange(event) {
    this.setState({
      usernameInput: event.target.value
    });
  }

  closeDisplayModal(event) {
    event.preventDefault();

    this.setState({
      displayModal: false,
      usernameInput: ''
    });
  }

  openDisplayModal(event) {
    event.preventDefault();

    this.setState({
      displayModal: true
    });
  }

  hasCheckedGists() {
    return this.state.checkedGists.length > 0;
  }

  deleteButtonClicked(event) {
    event.preventDefault();

    this.closeDisplayModal(event);

    fetch(API_ENDPOINT_DELETE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_token: this.state.access_token,
        ids: this.state.checkedGists
      })
    }).then(response => response.json()).then(data => {
      console.log(data);
    });

    this.setState({
      checkedGists: [],
      gists: this.state.gists.filter(gist => !this.state.checkedGists.includes(gist.name)),
      usernameInput: ''
    });

    toast.info(() => <p>Your gists are now being deleted.<br/>You'll get a notification when it's done!</p>);
  }

  toggleCheckBox(gistId) {
    let checkedGists = this.state.checkedGists;
    if(checkedGists.includes(gistId)) {
      this.setState({
        checkedGists: checkedGists.filter(item => item !== gistId)
      });
    } else {
      checkedGists.push(gistId);
      this.setState({
        checkedGists
      });
    }
  }

  toggleSelectAllCheckbox() {
    if(this.selectAllIsChecked()) {
      this.setState({
        checkedGists: []
      });
    } else {
      this.setState({
        checkedGists: this.state.gists.map((gist) => gist.id)
      });
    }
  }

  selectAllIsChecked() {
    return this.state.checkedGists.length === this.state.gists.length;
  }

  usernameInputIsEqualToUsername() {
    return this.state.usernameInput === this.state.username;
  }

  renderDate(dateAsString) {
    return moment.duration(moment().diff(moment.unix(dateAsString))).humanize() + ' ago';
  }

  render() {
    return (
      <div className="bg-gray-100">
        <header className="flex justify-center bg-black text-white p-2 header">
          <a href={ROUTE_LANDING_PAGE} className="flex align-middle">
            <img src={logo} alt="Gist Cleaner logo" className="page-logo"/>
            <h2 className="text-3xl font-bold ml-3">GitHub Gist Cleaner</h2>
          </a>
        </header>
        <section className="body-content flex md:max-w-5xl mx-auto">
          <div className="md:w-1/4 pt-6 px-3">
            <a href={this.state.url} target="_blank" rel="noopener noreferrer">
              <img src={this.state.avatar_url} alt="Avatar"/>
            </a>
            <div className="w-full">
              <h2 className="text-left text-2xl font-bold mt-2">
                {this.state.name}
              </h2>
              <h4 className="text-gray-700 text-xl font-normal -mt-2">
                {this.state.username}
              </h4>
              <p className="text-gray-900 text-sm mt-1">
                {this.state.bio}
              </p>
            </div>
          </div>
          <div className="md:w-3/4 pt-6 px-3">
            <div className="w-full flex items-center">
              <div className="w-4/12 pl-4">
                <CheckBox isChecked={this.selectAllIsChecked()} onChange={ () => this.toggleSelectAllCheckbox() } />
                <span className="ml-2">Select All</span>
              </div>
              <div className="w-8/12 text-right mb-3">
                <button disabled={!this.hasCheckedGists()} onClick={this.openDisplayModal} className={`${BASE_BUTTON_CLASS} ${ this.hasCheckedGists() ? '' :'opacity-50 cursor-not-allowed'}`}>
                  <img src={iconDelete} alt="Delete Icon" className="mr-1"/>
                  Delete Selected Gists
                </button>
              </div>
            </div>
            {this.state.gists.length === 0 ?(
              <div className="w-full mt-3">
                <h2 className="w-full text-center font-bold text-xl">You have no github gists!</h2>
              </div>
            ) : (
              this.state.gists.map((gist) => {
                  return (
                    <div className="w-full flex mb-3" key={gist.id}>
                      <div className="w-1/12 pl-4">
                        <CheckBox isChecked={this.state.checkedGists.includes(gist.name)} onChange={() => this.toggleCheckBox(gist.name)} />
                      </div>
                      <div className="w-11/12 header">
                        <div className="w-full flex bg-gray-300 rounded text-black px-3 border-2 rounded-b-none border-gray-400">
                          <div className="w-11/12">
                            <h2 className="font-bold">{gist.file_name}</h2>
                            <h5 className="text-xs">created {this.renderDate(gist.timestamp)}</h5>
                            <h4 className="text-sm">{gist.description}</h4>
                          </div>
                          <div className="w-1/12">
                          </div>
                        </div>
                        <div className="w-full border-b border-gray-300">
                          <div id={gist.id}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </section>
        <div id="resultsModal" style={{display: this.state.displayModal ? 'block' : 'none'}} className="modal">
          <div className="modal-content text-center">
            <div className="w-full">
              <button className="modal-close-btn" onClick={this.closeDisplayModal}>
                <img src={closeIcon} alt="Close icon"/>
              </button>
              <div className="text-center text">
                <p>
                  Are you sure you want to delete <span className="font-bold">{ this.state.checkedGists.length }</span> selected { this.state.checkedGists.length === 1 ? 'gist' : 'gists' }?
                </p>
                <p>Enter your github username below to confirm.</p>
                <input onInput={this.handleUsernameInputChange} onChange={this.handleUsernameInputChange} value={this.state.usernameInput} className={`${BASE_INPUT_CLASS} ${this.usernameInputIsEqualToUsername() ? 'border-green-500' : 'border-red-500'}`} placeholder="e.g GithubUsername" type="text"/>
                <div className="w-full">
                  <button onClick={this.deleteButtonClicked} disabled={!this.usernameInputIsEqualToUsername()} className={`${BASE_BUTTON_CLASS} ${this.usernameInputIsEqualToUsername() ? '': 'opacity-50 cursor-not-allowed'}`}>
                    <img src={iconDelete} alt="Delete Icon" className="mr-1"/>
                    Delete Selected Gists
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
