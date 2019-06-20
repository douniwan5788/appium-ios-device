const LOCKDOWN_PORT = 62078;
const LABEL = 'usbmuxd';
const PROTOCOL_VERSION = 2;

class Lockdown {

  constructor (plistService) {
    this.plistService = plistService;
  }

  async queryType (timeout = 5000) {
    const data = await this.plistService.sendPlistAndReceive({
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'QueryType'
    }, timeout);
    if (data.Request === 'QueryType' && data.Type === 'com.apple.mobile.lockdown') {
      return data;
    } else {
      throw new Error(`Unexpected data: ${JSON.stringify(data)}`);
    }
  }

  async startSession (hostID, systemBUID, timeout = 5000) {
    const data = await this.plistService.sendPlistAndReceive({
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'StartSession',
      HostID: hostID,
      SystemBUID: systemBUID
    }, timeout);

    if (data.Request === 'StartSession' && data.SessionID) {
      return { sessionID: data.SessionID, enableSessionSSL: data.EnableSessionSSL };
    } else {
      throw new Error(`Unexpected data: ${JSON.stringify(data)}`);
    }
  }

  enableSessionSSL (hostPrivateKey, hostCertificate) {
    this.plistService.enableSessionSSL(hostPrivateKey, hostCertificate);
  }

  async getValue (query = {}, timeout = 5000) {
    let plist = {
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'GetValue'
    };
    Object.assign(plist, query);
    const data = await this.plistService.sendPlistAndReceive(plist, timeout);
    if (data.Request === 'GetValue' && data.Value) {
      return data.Value;
    } else {
      throw new Error(`Unexpected data: ${JSON.stringify(data)}`);
    }
  }

  async startService (serviceName, timeout = 5000) {
    const data = await this.plistService.sendPlistAndReceive({
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'StartService',
      Service: serviceName,
    }, timeout);

    if (data.Error) {
      throw new Error(`Unexpected data: ${JSON.stringify(data)}`);
    } else {
      return data;
    }
  }

  close () {
    this.plistService.close();
  }
}

export { Lockdown, LOCKDOWN_PORT };
export default Lockdown;