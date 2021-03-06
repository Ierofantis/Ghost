const should = require('should');
const sinon = require('sinon');
const shared = require('../../../../server/api/shared');

describe('Unit: api/shared/http', function () {
    let req;
    let res;
    let next;

    beforeEach(function () {
        req = sinon.stub();
        res = sinon.stub();
        next = sinon.stub();

        req.body = {
            a: 'a'
        };

        res.status = sinon.stub();
        res.json = sinon.stub();
        res.set = sinon.stub();
        res.send = sinon.stub();

        sinon.stub(shared.headers, 'get').resolves();
    });

    afterEach(function () {
        sinon.restore();
    });

    it('check options', function () {
        const apiImpl = sinon.stub().resolves();
        shared.http(apiImpl)(req, res, next);

        Object.keys(apiImpl.args[0][0]).should.eql([
            'original',
            'options',
            'data',
            'user',
            'file',
            'files'
        ]);

        apiImpl.args[0][0].data.should.eql({a: 'a'});
        apiImpl.args[0][0].options.should.eql({
            context: {
                api_key_id: null,
                user: null,
                member: null
            }
        });
    });

    it('api response is fn', function (done) {
        const response = sinon.stub().callsFake(function (req, res, next) {
            should.exist(req);
            should.exist(res);
            should.exist(next);
            apiImpl.calledOnce.should.be.true();
            res.json.called.should.be.false();
            done();
        });

        const apiImpl = sinon.stub().resolves(response);
        shared.http(apiImpl)(req, res, next);
    });

    it('api response is fn', function (done) {
        const apiImpl = sinon.stub().resolves('data');

        next.callsFake(done);

        res.json.callsFake(function () {
            shared.headers.get.calledOnce.should.be.true();
            res.status.calledOnce.should.be.true();
            res.send.called.should.be.false();
            done();
        });

        shared.http(apiImpl)(req, res, next);
    });
});
