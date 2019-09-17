import React from 'react';
import 'pretty-checkbox';
import './style.scss';
import {GITHUB_AUTH_URL} from "../../constants/constants";
import logo from '../../images/github-logo.png';

const LandingPage = () =>
  <div className="app w-full h-screen flex">
    <div className="md:w-1/3 flex items-center">
      <div className="px-2">
        <h2 className="w-full text-center text-3xl">
          This app helps you (bulk) delete your github gists.
        </h2>
        <div className="w-full flex justify-center mt-3">
          <a className="auth-btn bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded inline-flex items-center" href={GITHUB_AUTH_URL}>
            <img src={logo} alt="Github Logo" className="mr-1"/>
            Sign in with github
          </a>
        </div>
      </div>
    </div>
    <div className="md:w-2/3 bg-green-700">
    </div>
  </div>;

export default LandingPage;
