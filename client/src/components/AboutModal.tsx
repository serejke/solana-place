import React from "react";
import {useAbout, useSetAbout} from "../providers/about/about";
import SolanaPlaceLogo from '../styles/icons/solana-place.png';
import { SocialIcon } from 'react-social-icons';

export function AboutModal() {
  const showAboutModal = useAbout().showAboutModal;
  const setAbout = useSetAbout();
  if (!showAboutModal) {
    return null;
  }
  return (
    <div className="about-modal">
      <div className="about-modal-dialog">
        <div className="about-modal-dialog-row about-modal-dialog-logo">
          <img src={SolanaPlaceLogo} alt="Place | Solana"/>
        </div>
        <div className="about-modal-dialog-row about-modal-dialog-text">
          <strong>Place | Solana</strong> is an on-chain pixel board for everyone to draw by changing colors of pixels.<br/><br/>
          The board is 300x500 pixels wide. In future it might be extended if the game attracts enough attention. Service fee to change a pixel is 0.001 SOL.<br/><br/>
          Welcome to the <a rel="noopener noreferrer" target="_blank" href="https://discord.gg/eSvvbHe86R">Discord</a> with feedback, suggestions and contributions!
        </div>
        <div className="about-modal-dialog-row">
          <SocialIcon
            className="about-modal-social-icon"
            rel="noopener noreferrer" target="_blank"
            url="https://github.com/serejke/solana-place"/>
          <SocialIcon
            className="about-modal-social-icon"
            rel="noopener noreferrer" target="_blank"
            url="https://discord.gg/eSvvbHe86R"/>
          <SocialIcon
            className="about-modal-social-icon"
            rel="noopener noreferrer" target="_blank"
            url="https://twitter.com/place_solana"/>
        </div>
      </div>
      <div className="about-modal-fade" onClick={() => setAbout(prevState => ({...prevState, showAboutModal: false}))}/>
    </div>
  );
}