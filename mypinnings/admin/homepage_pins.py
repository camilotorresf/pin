import json

from mypinnings import template
from mypinnings import database
from mypinnings.admin.auth import login_required


class HomepagePins(object):
    @login_required
    def GET(self):
        return template.admin.homepage_pins()
    
    
class CurrentPins(object):
    @login_required
    def GET(self):
        db = database.get_db()
        results = db.query('''
            select
                tags.tags, pins.*, users.pic as user_pic,
                users.username as user_username, users.name as user_name,
                count(distinct p1) as repin_count,
                count(distinct l1) as like_count
            from pins
                join homepage_pins on pins.id = homepage_pins.id
                left join tags on tags.pin_id = pins.id
                left join pins p1 on p1.repin = pins.id
                left join likes l1 on l1.pin_id = pins.id
                left join users on users.id = pins.user_id
                left join follows on follows.follow = users.id
                left join boards on pins.board_id = boards.id
            group by tags.tags, pins.id, users.id
            order by timestamp desc''')
        pins = []
        for row in results:
            pin = dict(row)
            pin['price'] = str(pin['price'])
            pins.append(pin)
        print(json.dumps(pins))
        return json.dumps(pins)


class UnselectedPins(object):
    @login_required
    def GET(self):
        db = database.get_db()
        results = db.query('''
            select
                tags.tags, pins.*, users.pic as user_pic,
                users.username as user_username, users.name as user_name,
                count(distinct p1) as repin_count,
                count(distinct l1) as like_count
            from pins
                left join tags on tags.pin_id = pins.id
                left join pins p1 on p1.repin = pins.id
                left join likes l1 on l1.pin_id = pins.id
                left join users on users.id = pins.user_id
                left join follows on follows.follow = users.id
                left join boards on pins.board_id = boards.id
            where pins.id not in (select id from homepage_pins)
            group by tags.tags, pins.id, users.id
            order by timestamp desc''')
        pins = []
        for row in results:
            pin = dict(row)
            pin['price'] = str(pin['price'])
            pins.append(pin)
        print(json.dumps(pins))
        return json.dumps(pins)
