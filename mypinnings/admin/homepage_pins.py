import json
import urllib

import web
from PIL import Image

from mypinnings import template
from mypinnings import database
from mypinnings import conf
from mypinnings import media
from mypinnings.admin.auth import login_required


IMAGE_BASE_HEIGHT = 269


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
        page = int(web.input().page)
        offset = page * conf.settings.PIN_COUNT
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
            order by timestamp desc
            offset $offset limit $limit''',
            vars={'offset': offset, 'limit': conf.settings.PIN_COUNT})
        pins = []
        for row in results:
            pin = dict(row)
            pin['price'] = str(pin['price'])
            pins.append(pin)
        print(json.dumps(pins))
        return json.dumps(pins)


class Pin(object):
    @login_required
    def PUT(self, pin_id):
        db = database.get_db()
        pin = db.where(table='pins', id=pin_id)[0]
        filename, _ = urllib.urlretrieve(pin.image_url)
        image = Image.open(filename)
        width, height = image.size
        scaling_ratio = IMAGE_BASE_HEIGHT / float(height)
        new_width = int(width * scaling_ratio)
        scaled_size = (new_width, IMAGE_BASE_HEIGHT)
        image.thumbnail(scaled_size, Image.ANTIALIAS)
        image.save(filename)
        images_dict = media.store_image_from_filename(db=db,
                                                      filename=filename,
                                                      widths=None)
        db.insert(tablename='homepage_pins',
                  id=pin_id,
                  image_url=images_dict[0]['url'],
                  image_width=new_width,
                  image_height=IMAGE_BASE_HEIGHT)
        return json.dumps({'status': 'ok'})

    @login_required
    def DELETE(self, pin_id):
        db = database.get_db()
        db.delete(table='homepage_pins',
                  where='id=$id',
                  vars={'id': pin_id})
        return json.dumps({'status': 'ok'})