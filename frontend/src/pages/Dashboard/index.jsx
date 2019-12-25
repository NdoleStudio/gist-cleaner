import React, {Component} from 'react';
import 'pretty-checkbox';
import './style.scss';
import '@mdi/font/css/materialdesignicons.min.css';
import logo from '../../images/logo.png'
import iconDelete from '../../images/icon-delete.png';
import closeIcon from '../../images/close-icon.svg';
import {ROUTE_LANDING_PAGE, BASE_INPUT_CLASS, BASE_BUTTON_CLASS} from "../../constants/constants";
import CheckBox from '../../components/CheckBox';
import postscribe from 'postscribe';
import {API_RESPONSE} from "../../services/api";
import moment from "moment";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedGists: [],
      gists: [],
      name: 'Acho Arnold',
      image_url: 'https://avatars3.githubusercontent.com/u/4196457?v=4',
      username: 'AchoArnold',
      displayModal: false,
      usernameInput: '',
      token: null
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
    this.setState({
      gists: API_RESPONSE,
    }, () => {
      this.state.gists.map((gist) => {
        // return postscribe('#' + gist.id, '<script src="https://gist.github.com/AchoArnold/' + gist.id + '.js"></script>');
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

  getFileName(gist) {
    return Object.keys(gist.files)[0];
  }

  deleteButtonClicked(event) {
    event.preventDefault();

    this.closeDisplayModal(event);

    this.setState({
      checkedGists: [],
      gists: this.state.gists.filter(gist => !this.state.checkedGists.includes(gist.id)),
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
    return moment.duration(moment().diff(moment(dateAsString))).humanize() + ' ago';
  }

  render() {
    return (
      <div>
        <header className="flex justify-center bg-black text-white p-2 header">
          <a href={ROUTE_LANDING_PAGE} className="flex align-middle">
            <img src={logo} alt="Gist Cleaner logo" className="page-logo"/>
            <h2 className="text-3xl font-bold ml-3">GitHub Gist Cleaner</h2>
          </a>
        </header>
        <section className="body-content bg-gray-600 flex md:max-w-5xl mx-auto">
          <div className="md:w-1/4 bg-red-400 pt-6 px-3">
            <img src={this.state.image_url} alt="Profile"/>
            <div className="w-full">
              <h2 className="text-left text-2xl font-bold mt-2">
                {this.state.name}
                <br/>
                <span className="text-gray-700 text-xl font-normal">
                {this.state.username}
              </span>
              </h2>
            </div>
          </div>
          <div className="md:w-3/4 bg-green-100 pt-6 px-3">
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
            { this.state.gists.map((gist) => {
              return (
                <div className="w-full flex mb-3" key={gist.id}>
                  <div className="w-1/12 pl-4">
                    <CheckBox isChecked={this.state.checkedGists.includes(gist.id)} onChange={() => this.toggleCheckBox(gist.id)} />
                  </div>
                  <div className="w-11/12 header">
                    <div className="w-full flex bg-gray-300 rounded text-black px-3 border-2 rounded-b-none border-gray-400">
                      <div className="w-11/12">
                        <h2 className="font-bold">
                          {this.getFileName(gist)}
                        </h2>
                        <h5 className="text-xs">created {this.renderDate(gist.created_at)}</h5>
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
            })}

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
                <input onInput={this.handleUsernameInputChange} value={this.state.usernameInput} className={`${BASE_INPUT_CLASS} ${this.usernameInputIsEqualToUsername() ? 'border-green-500' : 'border-red-500'}`} placeholder="e.g GithubUsername" type="text"/>
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
