export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GreenQuote Solar Financing API Docs',
    version: '1.0.0',
    description:
      'API documentation for the Cloover solar system pre-qualification application.',
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Liveness and dependency health check',
        description:
          'Returns the operational status of the API and its core infrastructure dependencies.',
        responses: {
          '200': {
            description: 'Application is fully operational.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthCheckResponse',
                },
              },
            },
          },
          '503': {
            description:
              'Service Unavailable or degraded due to database connection loss.',
          },
        },
      },
    },
    '/api/register': {
      post: {
        summary: 'User Registration',
        description:
          'Registers a new user account by validating the payload constraints, checking for email conflicts, and securely hashing the password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Account created successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description:
              'Bad Request - Invalid payload properties or Zod schema validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description:
              'Conflict - A user with the provided email address already exists.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description:
              'Internal Server Error - Unhandled exception during database write or password hashing.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/quotes': {
      post: {
        summary: 'Create Pre-qualification Solar Quote',
        description:
          'Evaluates input metrics to run proprietary backend pricing calculations, maps user risk tiers, constructs terms (5/10/15 years), and persists the complete quote details to the database.',
        security: [
          {
            SessionCookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/QuoteRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Quote evaluated and persisted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    quote: {
                      $ref: '#/components/schemas/QuoteObject',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description:
              'Unauthorized - No active or valid NextAuth session context found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '400': {
            description:
              'Bad Request - Structural errors found in schema parameters layout.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example:
                        'Invalid form input data parameters structural layout',
                    },
                    details: {
                      type: 'object',
                      description:
                        'Flattened key-value Zod error validation dictionary summary.',
                      example: {
                        address: ['Required'],
                        monthlyConsumptionKwh: [
                          'Expected number, received string',
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description:
              'Internal Server Error - Exception processing calculations engine or handling writes.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/quotes/{id}': {
      get: {
        summary: 'Get Single Quote Record',
        description:
          'Retrieves complete metrics for a unique quote. Enforces record ownership by blocking requests if the logged-in user is neither the resource creator nor an administrative account.',
        security: [
          {
            SessionCookieAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description:
              'The unique identifier string of the target quote record.',
            schema: {
              type: 'string',
              example: 'cl_12345abcde',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Quote retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    quote: {
                      $ref: '#/components/schemas/QuoteObject',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Session context missing or expired.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description:
              'Forbidden - Authenticated user lacks explicit permission flags or ownership rights to view this quote configuration file.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description:
              'Not Found - Quote record corresponding to the passed identifier does not exist within the data layer.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description:
              'Internal Server Error - Unhandled runtime service engine break during single quote parsing pipeline execution.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      SessionCookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description:
          'Standard NextAuth.js encryption session cookie token utilized to authenticate requests context-side.',
      },
    },
    schemas: {
      HealthCheckResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'UP' },
          timestamp: { type: 'string', example: '2026-07-07T19:45:00.000Z' },
          uptime: { type: 'number', example: 124.5 },
          services: {
            type: 'object',
            properties: {
              database: { type: 'string', example: 'UP' },
            },
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', example: 'Max Mustermann' },
          email: {
            type: 'string',
            format: 'email',
            example: 'max@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'SecureP@ss123!',
          },
        },
      },
      QuoteRequest: {
        type: 'object',
        required: [
          'fullName',
          'email',
          'address',
          'monthlyConsumptionKwh',
          'systemSizeKw',
        ],
        properties: {
          fullName: { type: 'string', example: 'Max Mustermann' },
          email: {
            type: 'string',
            format: 'email',
            example: 'max@example.com',
          },
          address: {
            type: 'string',
            example: 'Friedrichstraße 95, 10117 Berlin',
          },
          monthlyConsumptionKwh: { type: 'number', example: 450 },
          systemSizeKw: { type: 'number', example: 7.5 },
          downPayment: { type: 'number', example: 2000 },
        },
      },
      QuoteObject: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cl_12345abcde' },
          userId: { type: 'string', example: 'user_cl9988' },
          fullName: { type: 'string', example: 'Max Mustermann' },
          email: { type: 'string', example: 'max@example.com' },
          address: {
            type: 'string',
            example: 'Friedrichstraße 95, 10117 Berlin',
          },
          monthlyConsumptionKwh: { type: 'number', example: 450 },
          systemSizeKw: { type: 'number', example: 7.5 },
          downPayment: { type: 'number', example: 2000 },
          systemPrice: { type: 'number', example: 15000 },
          principalAmount: { type: 'number', example: 13000 },
          riskBand: { type: 'string', enum: ['A', 'B', 'C'], example: 'A' },
          offers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                termYears: { type: 'number', example: 10 },
                monthlyPayment: { type: 'number', example: 145.5 },
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-07-07T20:00:00.000Z',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Invalid operational parameter constraints verified.',
          },
        },
      },
    },
  },
};
