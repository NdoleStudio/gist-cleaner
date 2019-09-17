import React, {Component} from 'react';
import 'pretty-checkbox';
import './style.scss';
import '@mdi/font/css/materialdesignicons.min.css';
import logo from '../../images/logo.png'
import iconDelete from '../../images/icon-delete.png';
import {GITHUB_AUTH_URL, ROUTE_LANDING_PAGE} from "../../constants/constants";
import CheckBox from '../../components/CheckBox';
import postscribe from 'postscribe';

class Dashboard extends Component {
  componentDidMount() {
    postscribe('#tempElement', '<script src="https://gist.github.com/AchoArnold/a99b9b3f73fe3d07d08d0fb45f994b50.js"></script>');
  }
  render() {
    const data = {
      name: 'Acho Arnold',
      image_url: 'https://avatars3.githubusercontent.com/u/4196457?v=4',
      username: 'AchoArnold',
      file_name: 'UnsetterHelper.php',
      created_at: 'Created 3 months ago',
      description: 'Create a function unsetter() which unsets properties on nested objects.'
    };

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
            <div className="w-full text-right mb-3">
              <a className="auth-btn bg-transparent hover:bg-red-500 text-red-700 hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded inline-flex items-center" href={GITHUB_AUTH_URL}>
                <img src={iconDelete} alt="Delete Icon" className="mr-1"/>
                Delete Selected Gists
              </a>
            </div>
            <div className="w-full flex ">
              <div className="w-1/12 pl-4">
                <CheckBox/>
              </div>
              <div className="w-11/12">
                <div className="bg-gray-300 rounded text-black p-3 border-2 border-gray-400 flex">
                  <div className="w-11/12">
                    <div className="header flex">
                      <div className="w-1/12">
                        <span className="mr-1 bg-white text-red-600 px-1"><i className="mdi mdi-code-tags"></i></span>
                      </div>
                      <div className="w-11/12">
                        <h2 className="font-bold">
                          {data.file_name}
                        </h2>
                        <h5 className="text-xs">{data.created_at}</h5>
                        <h4 className="text-sm"> {data.description}</h4>
                      </div>
                    </div>
                    <div className="w-full">
                      <div id="tempElement" />
                    </div>
                  </div>
                  <div className="w-1/12 border border-blue-100">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
};

export default Dashboard;
