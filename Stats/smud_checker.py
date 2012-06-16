import json

bills = json.loads(open("smud.json","r").read())['smud_bills']

for bill in bills:
    sum = 0.0 
    check_sum = 0.0
    for rates in bill['rates']: 
        # bill only tallys up to 2 decimal places
        sum +=round(rates['usage'] * rates['rate'],2)
    for fixed in bill['flat_charges']:
        sum += fixed['total']

    if not (round(bill['total'],2) == round(sum),2): # meh, floating point error, no biggie
        print "error for bill %s" % bill['billing_date']
        print round(abs(bill['total']))
        print round(abs(sum))
        print ""

        for rates in bill['rates']: # check the varying rates
            check_sum =rates['usage'] * rates['rate']
            print "rates are %f" % check_sum
        for fixed in bill['flat_charges']: # check the fixed 
            check_sum = fixed['total']
            print "fixed are %f" % check_sum

        exit(1)

print "everything checks"

