import IonResponseHelper from 'v2/ion/IonResponseHelper';

describe('v2/ion/IonResponseHelper', function () {

  describe('converts top level messages to global error', () => {
    it('no messages', () => {
      const resp = {
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: '' ,
        }
      });
    });

    it('single message', () => {
      const resp = {
        messages: {
          value: [
            {
              'class': 'ERROR',
              'i18n': {
                'key': 'foo.error',
                'params': []
              },
              'message': 'Internal error foo'
            }
          ]
        }
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: 'Internal error foo' ,
        }
      });
    });

    it('multiple values', () => {
      const resp = {
        messages: {
          value: [
            {
              'class': 'ERROR',
              'i18n': {
                'key': 'foo.error',
                'params': []
              },
              'message': 'Internal error foo'
            },
            {
              'class': 'ERROR',
              'i18n': {
                'key': 'bar.error',
                'params': []
              },
              'message': 'bar error'
            }
          ]
        }
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: 'Internal error foo. bar error' ,
        }
      });
    });
  });

  describe('converts field level messages to error causes', () => {
    it('no remediation', () => {
      const resp = {
        remediation: {
          value: [
          ]
        }
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: '' ,
        }
      });
    });

    it('no fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test',
              value: [
                {
                  label: 'Login Name',
                  name: 'userName',
                }
              ]
            }
          ]
        }
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: '' ,
        }
      });
    });

    it('has fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test',
              value: [
                {
                  label: 'Login Name',
                  name: 'userName',
                  messages: {
                    value: [
                      {
                        'class': 'ERROR',
                        'i18n': {
                          'key': 'bar.error',
                          'params': []
                        },
                        'message': 'bar error'
                      }
                    ]
                  }
                },
                {
                  label: 'Password',
                  name: 'password',
                  messages: {
                    value: [
                      {
                        'class': 'ERROR',
                        'i18n': {
                          'key': 'foo1.error',
                          'params': []
                        },
                        'message': 'foo1 error'
                      },
                      {
                        'class': 'ERROR',
                        'i18n': {
                          'key': 'foo2.error',
                          'params': []
                        },
                        'message': 'foo2 error'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'userName', errorSummary: ['bar error'],
            },
            {
              property: 'password', errorSummary: ['foo1 error', 'foo2 error'],
            }
          ],
          errorSummary: '' ,
        }
      });
    });

    it('has `form` fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test-form',
              value: [
                {
                  name: 'credentials',
                  form: {
                    value: [
                      {
                        label: 'Login Name',
                        name: 'userName',
                        messages: {
                          value: [
                            {
                              'class': 'ERROR',
                              'i18n': {
                                'key': 'bar.error',
                                'params': []
                              },
                              'message': 'bar error'
                            }
                          ]
                        }
                      },
                      {
                        label: 'Password',
                        name: 'password',
                        messages: {
                          value: [
                            {
                              'class': 'ERROR',
                              'i18n': {
                                'key': 'foo.error',
                                'params': []
                              },
                              'message': 'foo error'
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'credentials.userName', errorSummary: ['bar error'],
            },
            {
              property: 'credentials.password', errorSummary: ['foo error'],
            }
          ],
          errorSummary: '' ,
        }
      });
    });

    it('has `options` fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test-form',
              value: [
                {
                  name: 'authenticator',
                  options: [
                    {
                      label: 'xxx',
                      value: {
                        form: {
                          value: [
                            {
                              label: 'Question',
                              name: 'question',
                            },
                            {
                              label: 'Answer',
                              name: 'answer',
                              messages: {
                                value: [
                                  {
                                    'class': 'ERROR',
                                    'i18n': {
                                      'key': 'foo.error',
                                      'params': []
                                    },
                                    'message': 'foo error'
                                  }
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  ]

                }
              ]
            }
          ]
        }
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'authenticator.answer', errorSummary: ['foo error'],
            }
          ],
          errorSummary: '' ,
        }
      });
    });
  });
});
