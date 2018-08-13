import * as rp from "request-promise";

export class TestClient {
  private url: string;
  private options: {
    jar: any;
    withCredentials: boolean;
    json: boolean;
  };
  constructor(urlExtra?: string) {
    this.url = urlExtra
      ? (process.env.TEST_HOST as string) + urlExtra
      : (process.env.TEST_HOST as string);
    this.options = {
      jar: rp.jar(),
      json: true,
      withCredentials: true
    };
  }

  public async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
        login(email: "${email}", password: "${password}") {
          path
          message
          
            }
        }
        `
      }
    });
  }
  public async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        {
        me {
            id
            email
        }

        }

    `
      }
    });
  }
  public async forgotPasswordChange(password: string, key: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation{
        forgotPasswordChange(newPassword: "${password}", key: "${key}") {
            path
            message
        }

        }

    `
      }
    });
  }
  public async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
    mutation {
      logout
    }
`
      }
    });
  }

  public async register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
    mutation {
        register(email: "${email}", password: "${password}") {
          path
          message
        }
    }
`
      }
    });
  }
}
