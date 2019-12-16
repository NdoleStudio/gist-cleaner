import React, {Component} from 'react';
import 'pretty-checkbox';
import './style.scss';
import '@mdi/font/css/materialdesignicons.min.css';
import logo from '../../images/logo.png'
import iconDelete from '../../images/icon-delete.png';
import closeIcon from '../../images/close-icon.svg';
import {GITHUB_AUTH_URL, ROUTE_LANDING_PAGE} from "../../constants/constants";
import CheckBox from '../../components/CheckBox';
import postscribe from 'postscribe';
import {API_RESPONSE} from "../../services/api";
import moment from "moment";

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
    };

    this.openDisplayModal = this.openDisplayModal.bind(this);
    this.closeDisplayModal = this.closeDisplayModal.bind(this);
  }

  componentDidMount() {
    this.setState({
      gists: API_RESPONSE,
    }, () => {
      this.state.gists.map((gist) => {
        return postscribe('#' + gist.id, '<script src="https://gist.github.com/AchoArnold/' + gist.id + '.js"></script>');
      });
    });
  }

  closeDisplayModal(event) {
    event.preventDefault();

    this.setState({
      displayModal: false
    });
  }

  openDisplayModal(event) {
    event.preventDefault();

    this.setState({
      displayModal: true
    });
  }

  getFileName(gist) {
    for (let file in gist.files) {
        return file;
    }
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
                <a onClick={this.openDisplayModal} className="auth-btn bg-transparent hover:bg-red-500 text-red-700 hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded inline-flex items-center" href={GITHUB_AUTH_URL}>
                  <img src={iconDelete} alt="Delete Icon" className="mr-1"/>
                  Delete Selected Gists
                </a>
              </div>
            </div>
            { this.state.gists.map((gist, key) => {
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
                      <div className="w-1/12 border border-blue-200">
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
                <img src={closeIcon}/>
              </button>
              <div className="text">
                <p>How are you doing today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
