import React, {Component} from 'react';
import 'pretty-checkbox';
import './style.scss';
import '@mdi/font/css/materialdesignicons.min.css';
import logo from '../../images/logo.png'
import iconDelete from '../../images/icon-delete.png';
import {GITHUB_AUTH_URL, ROUTE_LANDING_PAGE} from "../../constants/constants";
import CheckBox from '../../components/CheckBox';
import postscribe from 'postscribe';
import {API_RESPONSE} from "../../services/api";
import moment from "moment";

class Dashboard extends Component {
  componentDidMount() {
    API_RESPONSE.map(function(gist) {
      postscribe('#' + gist.id, '<script src="https://gist.github.com/AchoArnold/' + gist.id + '.js"></script>');
    });
  }

  getFileName(gist) {
    for (let file in gist.files) {
        return file;
    }
  }

  renderDate(dateAsString) {
    return moment.duration(moment().diff(moment(dateAsString))).humanize() + ' ago';
  }

  render() {
    const data = {
      name: 'Acho Arnold',
      image_url: 'https://avatars3.githubusercontent.com/u/4196457?v=4',
      username: 'AchoArnold',
      file_name: 'UnsetterHelper.php',
      created_at: 'Created 3 months ago',
      description: 'Create a function unsetter() which unsets properties on nested objects.',
      gists: API_RESPONSE
    };


    let checkedCheckboxes = [];

    return (
      <div>
        <header className="flex justify-center bg-black text-white p-2 header">
          <a href={ROUTE_LANDING_PAGE} className="flex align-middle">
            <img src={logo} alt="Gist Cleaner logo"  className="page-logo"/>
            <h2 className="text-3xl font-bold ml-3">GitHub Gist Cleaner</h2>
          </a>
        </header>
        <section className="body-content bg-gray-600 flex md:max-w-5xl mx-auto">
          <div className="md:w-1/4 bg-red-400 pt-6 px-3">
            <img src={data.image_url} alt="Profile"/>
            <div className="w-full">
              <h2 className="text-left text-2xl font-bold mt-2">
                {data.name}
                <br/>
                <span className="text-gray-700 text-xl font-normal">
                {data.username}
              </span>
              </h2>
            </div>
          </div>
          <div className="md:w-3/4 bg-green-100 pt-6 px-3">
            <div className="w-full flex items-center">
              <div className="w-4/12 pl-4">
                <CheckBox/>
                <span className="ml-2">Select All</span>
              </div>
              <div className="w-8/12 text-right mb-3">
                <a className="auth-btn bg-transparent hover:bg-red-500 text-red-700 hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded inline-flex items-center" href={GITHUB_AUTH_URL}>
                  <img src={iconDelete} alt="Delete Icon" className="mr-1"/>
                  Delete Selected Gists
                </a>
              </div>
            </div>
            { data.gists.map((gist, key) => {
              return (
                <div className="w-full flex mb-3" key={gist.id}>
                  <div className="w-1/12 pl-4">
                    <CheckBox isChecked={checkedCheckboxes.includes(gist.id)}/>
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
      </div>
    );
  }
};

export default Dashboard;
