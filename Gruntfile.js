module.exports = function (grunt) {
    require("time-grunt")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        opt: {
            client: {
                "tsMain": "lib",
                "tsTest": "test",

                "jsMainOut": "lib",
                "jsTestOut": "test"
            }
        },

        ts: {
            default: {
                tsconfig: {
                    tsconfig: "./tsconfig.json",
                    updateFiles:false
                }
            }
        },
        tsconfig: {
            main: {
            }
        },
        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            files: {
                src: [
                    '<%= opt.client.tsMain %>/**/*.ts',
                    '<%= opt.client.tsTest %>/**/*.ts',
                    '!<%= opt.client.tsMain %>/**/*.d.ts'
                ]
            }
        },
        typedoc: {
            main: {
                options: {
                    module: "<%= ts.options.module %>",
                    out: './docs',
                    name: '<%= pkg.name %>',
                    target: "<%= ts.options.target %>"
                },
                src: [
                    '<%= opt.client.tsMain %>/**/*.ts'
                ]
            }
        },
        dtsm: {
            client: {
                options: {
                    // optional: specify config file
                    confog: './dtsm.json'
                }
            }
        },
        clean: {
            clientScript: {
                src: [
                    // client
                    '<%= opt.client.jsMainOut %>/*.js',
                    '<%= opt.client.jsMainOut %>/*.d.ts',
                    '<%= opt.client.jsMainOut %>/*.js.map',
                    '!<%= opt.client.jsMainOut %>/insight.d.ts',
                    // client test
                    '<%= opt.client.jsTestOut %>/*.js',
                    '<%= opt.client.jsTestOut %>/*.js.map',
                    '<%= opt.client.jsTestOut %>/*.d.ts',
                    // peg.js
                    '<%= opt.client.peg %>/grammar.js'
                ]
            },
            dtsm: {
                src: [
                    // dtsm installed
                    "typings/"
                ]
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: 60000,
                    require: [
                        function () {
                            require('espower-loader')({
                                cwd: process.cwd() + '/' + grunt.config.get("opt.client.jsTestOut"),
                                pattern: '**/*.js'
                            });
                        },
                        function () {
                            assert = require('power-assert');
                        }
                    ]
                },
                src: [
                    '<%= opt.client.jsTestOut %>/**/*_spec.js'
                ]
            }
        }
    });

    grunt.registerTask(
        'setup',
        ['clean', 'dtsm']);

    grunt.registerTask(
        'default',
        ['tsconfig', 'ts', 'tslint']);

    grunt.registerTask(
        'test',
        ['default', 'mochaTest']);

    require('load-grunt-tasks')(grunt);
};
